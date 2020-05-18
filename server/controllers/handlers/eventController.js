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




const handleGetEvents = async (req, res, next) => {

    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    //connect to db
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in handleGetEvents")
        try {
            const db = client.db(dbName)
            //insert the hosting info into DB
            await db.collection(collectionEvents).find()
                .toArray()
                .then(data => {
                    res.status(200).json({
                        status: 200,
                        message: "Success getting all events!",
                        events: data
                    })
                })

        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleEvents')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}

//@endpoint GET /userEvents/:_id
//@desc get events associated with current user logged in.
//@access PRIVATE - will need to validate token? YES
const handleUserEvents = async (req, res, next) => {
    const _id = req.params._id;
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    //dsfsdfasddsa
    //connect to db
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in handleUserEvents")
        try {
            const db = client.db(dbName)
            //insert the hosting info into DB
            let allData = await db.collection(collectionEvents).find({ userId: _id }).toArray()
            if (!allData) {
                res.status(404).json({ status: 404, message: 'There are no events booked.' })
            } else {
                let participants = [];
                allData.forEach(data => {
                    participants.push(ObjectId(data.participantId))
                })
                let participantData = await db.collection(collectionParticipants).find({ _id: { $in: participants } }).toArray();

                res.status(200).json({
                    status: 200,
                    message: "Success getting all events associated with the user!",
                    events: allData,
                    participants: participantData
                })
            }
            //
        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleUserevents')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}



//@endpoint POST /viewActivityEvents
//@desc get all events associated with that park.
//@access PRIVATE - will need to validate token? YES
const handleViewActivityEvents = async (req, res, next) => {

    let parkId = req.body.selectedPark;
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    //dsfsdfasddsa
    //connect to db
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in handleViewActivityEvents")
        try {
            const db = client.db(dbName)
            //insert the hosting info into DB
            let allData = await db.collection(collectionEvents).find({ parkId: parkId }).toArray()

            console.log(allData)
            if (!allData) {
                res.status(404).json({ status: 404, message: 'There are no events booked.' })
            } else {
                let participants = [];
                allData.forEach(data => {
                    participants.push(ObjectId(data.participantId))
                })
                let participantData = await db.collection(collectionParticipants).find({ _id: { $in: participants } }).toArray();

                res.status(200).json({
                    status: 200,
                    message: "Success getting all events associated with the user!",
                    participants: participantData
                })
            }
            //
        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleViewActivityevents')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}

//@endpoint POST /viewActivityEvents
//@desc get all events associated with that park.
//@access PRIVATE - will need to validate token? YES
const handleCurrentEventParticipants = async (req, res, next) => {

    let participantId = req.params.participantId
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    //dsfsdfasddsa
    //connect to db
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in handleViewActivityEvents")
        try {
            const db = client.db(dbName)
            //insert the hosting info into DB
            let participantData = await db.collection(collectionParticipants).findOne({ _id: ObjectId(participantId) })
            if (!participantData) {
                res.status(400).json({ status: 400, message: "Currently no participants registered for this event." })
            }
            else {
                res.status(200).json({
                    status: 200,
                    message: "Success getting participants for single event.",
                    eventParticipants: participantData.participants
                })
            }
            //
        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleViewActivityevents')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}
//@endpoint GET /selectedParkEvents
//@desc get all events associated with the selected park.
//@access PRIVATE - will need to validate token? YES
//NOTES - CHECK HANDLEGETEVENTS
const handleSelectedParkEvents = async (req, res, next) => {

    let parkId = req.params.parkId;

    console.log(parkId, 'HANDLESELECTEDPARKEVENTS')


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
            //insert the hosting info into DB
            await db.collection(collectionEvents).find({ parkId: parkId })
                .toArray()
                .then(data => {

                    res.status(200).json({
                        status: 200,
                        message: "Success getting all events for selected park!",
                        events: data
                    })
                })

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

module.exports = {
    handleGetEvents, handleUserEvents,
    handleViewActivityEvents,
    handleCurrentEventParticipants,
    handleSelectedParkEvents,
}