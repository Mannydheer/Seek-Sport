
'use strict';

//MONGODB
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://dbUser:YOFwbi6x3P5o3H4d@cluster0-seh3x.mongodb.net/test?authSource=admin&replicaSet=Cluster0-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true"

const dbName = 'ParkGames';
const collectionUsers = 'Users'
const collectionHosts = 'Hosts'
const collectionEvents = 'Events'
const collectionParticipants = 'Participants'
const collectionUserEvents = 'UserEvents'
const collectionRooms = 'Rooms'

const assert = require('assert')
var ObjectId = require('mongodb').ObjectID;
//
const multer = require('multer')
const fileUpload = require('express-fileupload')
//
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
//env vairablkes
require('dotenv').config();

//allows to fetch to an API from backend with fetch method API.
const fetch = require('isomorphic-fetch');



//@endpoint GET /userActivities
//@desc get all events that the user joined
//@access PRIVATE - will need to validate token? YES
const handleUserActivities = async (req, res, next) => {

    let userId = req.params.userId;
    console.log(userId, 'inside handleuseracitivties')



    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    //connect to db
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in handleSelectedParkEvents")
        try {
            const db = client.db(dbName)
            let userData = await db.collection(collectionUserEvents).findOne({ _id: ObjectId(userId) })
            console.log(userData)

            //if you have never signed up for any events yet.

            if (!userData.events) {
                res.status(400).json({
                    status: 400,
                    message: 'Seems like you are new, you may head to the home page to find activities or talk to our chatbot!'
                })
            }
            else {
                //if you registered for events.
                let allEvents = [];
                userData.events.forEach(event => {
                    allEvents.push(ObjectId(event))
                })
                let eventData = await db.collection(collectionEvents)
                    .find({ _id: { $in: allEvents } })
                    .toArray();

                if (eventData.length > 0) {
                    let filteredEventData = eventData.filter(event => {
                        if (event.userId !== userId) {
                            return event;
                        }
                    })
                    res.status(200).json({ status: 200, message: 'Success getting all events you have registered for!', events: filteredEventData })
                }
                else {
                    res.status(400).json({ status: 400, message: 'Seems like you have no registered to any events! Head to the home page to find activities!' })
                }
                //find all the events that you have registered for.
            }
        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleSelectedParkEvents')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}

//@endpoint GET /userRegisteredEvents/:_id
//@desc get registered events associated with current user logged in.
//@access PRIVATE - will need to validate token? YES
const handleUserRegisteredEvents = async (req, res, next) => {

    const id = req.params._id;
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    //dsfsdfasddsa
    //connect to db
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in handleUserRegisteredEvents ")
        try {
            const db = client.db(dbName)
            //insert the hosting info into DB
            let allData = await db.collection(collectionUserEvents).findOne({ _id: ObjectId(id) })
            if (!allData.events) {
                res.status(404).json({ status: 404, message: 'There are no registered events under this user.' })
            } else {

                //now we have array of event Ids... we can get back all ids.
                let allEvents = [];
                allData.events.forEach(data => {
                    allEvents.push(ObjectId(data))
                })
                let getEvents = await db.collection(collectionEvents).find({ _id: { $in: allEvents } }).toArray();

                res.status(200).json({
                    status: 200,
                    message: "Success getting all registered events associated with the user!",
                    userRegisteredEvents: allData.events,
                    eventInfo: getEvents,
                })
            }
        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleUserRegisteredEvents ')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}

module.exports = {
    handleUserActivities, handleUserRegisteredEvents,

}