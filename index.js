'use strict';

// 
// Dependencies
//
const BaseJoi = require('joi');
const Extension = require('joi-date-extensions');
const Joi = BaseJoi.extend(Extension);
const express = require('express');
const monk = require('monk');


//
// Our configuration file
//
const config = require('./config.json');

//
// Connect to the database
//
const db = monk(`${config.database.url}:${config.database.port}/notable`);

// 
// Do Express
//
const app = express();
app.use(express.json());

//
// Return a list of doctors, _id is doctorID in REST calls
//
app.get('/api/doctors', (req, res) => {
    const collection = db.get('doctors');

    collection.find({}, {sort:{"name.last": 1}}, function(err, doctors) {
        if ( err ) return res.status(400).send(err.details[0].message); 
        res.json(doctors);
    });
});

//
// Return a list of appointments, _id is appointment in REST calls
//
app.get('/api/appointments', (req, res) => {
    const collection = db.get('appointments');

    collection.find({}, {}, function(err, appointments) {
        if ( err ) return res.status(400).send(err.details[0].message); 
        res.json(appointments);
    });
});

// Get a list of all appointments for a particular doctor and particular day
// _id returned is appointmentID in REST calls
// Date is YYYYMMDD format
app.get('/api/appointments/:doctorID/:date', (req, res) => {
    const doctorID = monk.id(req.params.doctorID);
    const date = req.params.date;

    const collection = db.get('appointments');
    collection.find({"doctorID": doctorID, "date": date},
        {sort:{"time":1}}, function(err, appointments) {
            if ( err ) return res.status(400).send(err.details[0].message); 
            res.json(appointments);
        });

});

// Add a new appointment to a doctor's calendar
// New appointments can only start at 15 minute intervals 
//   (i.e. 8:15am is a valid time but 8:20am is not)
//   Use 24-hr clock, e.g. 08:15am is 08:15, 08:15pm is 20:15
// A doctor can have multiple appointments with the same time, 
//   but no more than 3 appointments can be added with the 
//   same time for a given doctor
app.post('/api/appointments/:doctorID', (req, res) => {
    const schema = {
        // date is required, must be valid
        date: Joi.date().format("YYYYMMDD").required(),
        // time is required, must be of format HH:MM
        time: Joi.date().format("HH:mm").required(),
        // firstName is requred, must be at least one character and alphanumeric, 64 name length
        firstName: Joi.string().min(config.parameters.minFirstNameLength)
                    .max(config.parameters.maxFirstNameLength).alphanum().required(),
        // firstName is requred, must be at least one character and alphanumeric, 64 name length
        lastName: Joi.string().min(config.parameters.minLastNameLength)
                    .max(config.parameters.maxLastNameLength).alphanum().required(),
        // type is required, going to check value further down, max length
        type: Joi.string().min(1).max(11).required(),
    };

    // Validate the input and let the user know if it is bad
    Joi.validate(req.body, schema, (err, value) => {
        if ( err ) return res.status(400).send(err.details[0].message);

        // Ensure that minutes are on the quarter hours
        let appointmentTime = new Date(value.time);
        if ( appointmentTime.getMinutes() % 15 ) {
            return res.status(400).send("Minutes must be on a quarter hour")
        }

        // Make sure that type is either "New Patient" or "Follow-up"
        if ( (value.type != "New Patient") && (value.type != "Follow-up") ) {
            return res.status(400).send("type must be \"New Patient\" or \"Follow-up\"");
        }

        // check if this is a valid doctor, if not, do not update
        const doctors = db.get('doctors');
        const doctorID = monk.id(req.params.doctorID);

        doctors.find({"_id": doctorID}, function(err, doctors) {
            if ( err ) {
                return res.status(400).send(err.details[0].message);
            }
            if (!doctors.length) return res.status(400).send(`DoctorID ${doctorID} does not exist`);

            const appointments = db.get('appointments');
            const date = req.body.date;
            const time = req.body.time;
            appointments.find({"doctorID": doctorID, "date":date, "time":time}, {}, function(err, results) {
                    // Make sure there are not already 3 appointments in this time slot
                    if (results.length >= config.parameters.maxOverlappingAppointments ) {
                        console.log("length is " + results.length);
                        return res.status(400).send(`Already have ${config.parameters.maxOverlappingAppointments} for that doctor at that time`);
                    }

                // We know everything exists, so prepare for insert
                const type = req.body.type;
                const firstName = req.body.firstName;
                const lastName = req.body.lastName;
                const appointment = {
                    "doctorID": doctorID,
                    "name": {
                        "first": firstName,
                        "last": lastName
                    },
                    "date": date,
                    "time": time,
                    "type": type
                };
    
                appointments.insert(appointment, function(err, appointment) {
                    if ( err ) return res.status(400).send(err.details[0].message); 
                    res.send(appointment);
                });
            });
        });
    });
});

// Delete an existing appointment from a doctor's calendar
app.delete('/api/appointments/:appointmentID', (req, res) => {
    const appointmentID = monk.id(req.params.appointmentID);

    const collection = db.get('appointments');
    collection.remove({"_id": appointmentID}, {}, function(err, appointment) {
        if ( err ) return res.status(400).send(err.details[0].message); 
        res.json(appointment);
    });

});

// Listen on the specified port
app.listen(config.server.port, () => console.log(`Listening on port ${config.server.port}...`));
