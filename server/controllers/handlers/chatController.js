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





//@endpoint GET /getChatRoom
//@desc get chat room ID for specified EVENT.
//@access PRIVATE - will need to validate token? YES - add...
const handleGetChatRoom = async (req, res, next) => {
    const eventId = req.params.eventId;

    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    //dsfsdfasddsa
    //connect to db
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in handleGetChatRoom ")
        try {
            const db = client.db(dbName)
            let eventData = await db.collection(collectionEvents).findOne({ _id: ObjectId(eventId) })
            //since we are making a participant ID as soon as we host an event.
            //so check if there is no event.
            if (!eventData) {
                res.status(404).json({ status: 404, message: 'There are no events.' })
            } else {
                let participantData = await db.collection(collectionParticipants).findOne({ _id: ObjectId(eventData.participantId) })
                //since the participantId is the room ID...
                res.status(200).json({
                    status: 200,
                    message: "Success getting participantID events associated with the event.",
                    participantId: eventData.participantId,
                    eventParticipants: participantData.participants,

                })
            }
        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleGetChatRoom ')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}


module.exports = {
    handleGetChatRoom,
}