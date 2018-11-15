'use strict';

// 
// Dependencies
//
const Joi = require('joi');
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
// New appointments can only start at 15 minute intervals 
//   (i.e. 8:15am is a valid time but 8:20am is not)
// A doctor can have multiple appointments with the same time, 
//   but no more than 3 appointments can be added with the 
//   same time for a given doctor
//
function validateAppointment(appointment) {
    const schema = {
        appointment: Joi.string().min(3).required()
    };

    return Joi.validate(course, schema);
}

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
app.post('/api/appointments/:doctorID', (req, res) => {
    res.send("POST /api/appointments/:doctorID TBD");

    //const { error } = validateCourse(req.body); // equivalent to result.error
    //if ( error ) return res.status(400).send(result.error.details[0].message);

    //const course = {
    //id: courses.length + 1,
    //name: req.body.name
    //};

    //courses.push(course);
    //res.send(course);
});

// Delete an existing appointment from a doctor's calendar
app.delete('/api/appointment/:appointmentID', (req, res) => {
    const appointmentID = monk.id(req.params.appointmentID);

    const collection = db.get('appointments');
    collection.remove({"_id": appointmentID}, {}, function(err, appointment) {
        if ( err ) return res.status(400).send(err.details[0].message); 
        res.json(appointment);
    });

});

// Listen on the specified port
app.listen(config.server.port, () => console.log(`Listening on port ${config.server.port}...`));
