'use strict';
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
            "_id": "5becafede2ac7cdc2c68f373",
            "name": {
                "first": "Julius",
                "last": "Hibbert"
            }
        },
        {
            "_id": "5becaffce2ac7cdc2c68f377",
            "name": {
                "first": "Algernop",
                "last": "Krieger"
            }
        },
        {
            "_id": "5becb007e2ac7cdc2c68f37b",
            "name": {
                "first": "Nick",
                "last": "Riviera"
            }
        }
    ]);

    // Populate the appointments collection
    await db.get('appointments').insert([
        {
            "_id": "5becbbb5e2ac7cdc2c68f5f3",
            "doctorID": "5becafede2ac7cdc2c68f373",
            "name": {
                "first": "Clark",
                "last": "Kent"
            },
            "date": "20180617",
            "time": "08:00:00",
            "type": "New Patient"
        },
        {
            "_id": "5becbbdfe2ac7cdc2c68f60d",
            "doctorID": "5becafede2ac7cdc2c68f373",
            "name": {
                "first": "Lois",
                "last": "Lane"
            },
            "date": "20180617",
            "time": "08:00:00",
            "type": "Follow-up"
        },
        {
            "_id": "5becbbf6e2ac7cdc2c68f616",
            "doctorID": "5becafede2ac7cdc2c68f373",
            "name": {
                "first": "Lex",
                "last": "Luthor"
            },
            "date": "20180617",
            "time": "08:00:00",
            "type": "New Patient"
        },
        {
            "_id": "5becbc1ae2ac7cdc2c68f630",
            "doctorID": "5becafede2ac7cdc2c68f373",
            "name": {
                "first": "Lex",
                "last": "Luthor"
            },
            "date": "20180617",
            "time": "09:00:00",
            "type": "Follow-up"
        },
        {
            "_id": "5becbc24e2ac7cdc2c68f636",
            "doctorID": "5becafede2ac7cdc2c68f373",
            "name": {
                "first": "Lex",
                "last": "Luthor"
            },
            "date": "20180618",
            "time": "09:00:00",
            "type": "Follow-up"
        },
        {
            "_id": "5becd399e2ac7cdc2c68fd3b",
            "doctorID": "5becaffce2ac7cdc2c68f377",
            "name": {
                "first": "Clark",
                "last": "Kent"
            },
            "date": "20180617",
            "time": "08:00:00",
            "type": "New Patient"
        },
        {
            "_id": "5bed01a7e2ac7cdc2c6902b9",
            "doctorID": "5becafede2ac7cdc2c68f373",
            "name": {
                "first": "Lex",
                "last": "Luthor"
            },
            "date": "20180617",
            "time": "07:00:00",
            "type": "Follow-up"
        }
    ]);

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
