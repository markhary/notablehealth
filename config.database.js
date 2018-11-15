'use strict';
const timeoutPromise = (timeout) => {
return new Promise((resolve) => setTimeout(resolve, timeout));
};

(async () => {
    //
    // Put the database into the default state
    //
    const monk = require('monk');

    //
    // Our configuration file
    //
    const config = require('./config.json');

    // Connect to the database
    const db = monk(`${config.database.url}:${config.database.port}/notable`);

    // Drop existing collections, if any
    await db.get('doctors').drop();
    await db.get('doctors').find({}, function(err, res) {
        console.log("Dropped doctors: " + JSON.stringify(res));
    });

    await db.get('appointments').drop();
    await db.get('appointments').find({}, function(err, res) {
        console.log("Dropped appointments: " + JSON.stringify(res));
    });

    // Populate the doctor collection
    await db.get('doctors').insert([
        {
            "name": {
                "first": "Julius",
                "last": "Hibbert"
            }
        },
        {
            "name": {
                "first": "Algernop",
                "last": "Krieger"
            }
        },
        {
            "name": {
                "first": "Nick",
                "last": "Riviera"
            }
        }
    ]);

    await db.get('doctors').find({}, {sort:{"name.last": 1}}, function(err, doctors) {
        const drHibbertID = doctors[0]._id;
        const drKriegerID = doctors[1]._id;

        console.log("Dr Julius has ID " + drHibbertID);
        console.log("Dr Krieger has ID " + drKriegerID);

        // Populate the appointments collection
        db.get('appointments').insert([
            {
                "doctorID": drHibbertID,
                "name": {
                    "first": "Clark",
                    "last": "Kent"
                },
                "date": "20180617",
                "time": "08:00",
                "type": "New Patient"
            },
            {
                "doctorID": drHibbertID,
                "name": {
                    "first": "Lois",
                    "last": "Lane"
                },
                "date": "20180617",
                "time": "08:00",
                "type": "Follow-up"
            },
            {
                "doctorID": drHibbertID,
                "name": {
                    "first": "Lex",
                    "last": "Luthor"
                },
                "date": "20180617",
                "time": "08:00",
                "type": "New Patient"
            },
            {
                "doctorID": drHibbertID,
                "name": {
                    "first": "Lex",
                    "last": "Luthor"
                },
                "date": "20180617",
                "time": "09:00",
                "type": "Follow-up"
            },
            {
                "doctorID": drHibbertID,
                "name": {
                    "first": "Lex",
                    "last": "Luthor"
                },
                "date": "20180618",
                "time": "09:00",
                "type": "Follow-up"
            },
            {
                "doctorID": drKriegerID,
                "name": {
                    "first": "Clark",
                    "last": "Kent"
                },
                "date": "20180617",
                "time": "08:00",
                "type": "New Patient"
            },
            {
                "doctorID": drHibbertID,
                "name": {
                    "first": "Lex",
                    "last": "Luthor"
                },
                "date": "20180617",
                "time": "07:00",
                "type": "Follow-up"
            }
        ]);
    });

    await timeoutPromise(2000);

    await db.get('doctors').find({}, function(err, res) {
        console.log("Populated doctors: " + JSON.stringify(res));
    });

    await db.get('appointments').find({}, function(err, res) {
        console.log("Populated appointments: " + JSON.stringify(res));
    });

    await db.close();

})().catch(err=> {
    console.error(err);
})
