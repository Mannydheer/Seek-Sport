'use strict';

//MONGODB
const { getConnection } = require('../../connection/connection');

const dbName = 'ParkGames';
const collectionEvents = 'Events'
const collectionParticipants = 'Participants'
var ObjectId = require('mongodb').ObjectID;
//env vairablkes
require('dotenv').config();





const handleGetEvents = async (req, res, next) => {

    try {
        const db = getConnection().db(dbName)
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
}

//@endpoint GET /userEvents/:_id
//@desc get events associated with current user logged in.
//@access PRIVATE - will need to validate token? YES
const handleUserEvents = async (req, res, next) => {
    const _id = req.params._id;

    try {
        const db = getConnection().db(dbName)
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
    }
    catch (error) {
        console.log(error.stack, 'Catch Error in handleUserevents')
        res.status(500).json({ status: 500, message: error.message })
    }
}



//@endpoint POST /viewActivityEvents
//@desc get all events associated with that park.
//@access PRIVATE - will need to validate token? YES
const handleViewActivityEvents = async (req, res, next) => {

    let parkId = req.body.selectedPark;
    try {
        const db = getConnection().db(dbName)
        //insert the hosting info into DB
        let allData = await db.collection(collectionEvents).find({ parkId: parkId }).toArray()

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
    }
    catch (error) {
        console.log(error.stack, 'Catch Error in handleViewActivityevents')
        res.status(500).json({ status: 500, message: error.message })
    }
}

//@endpoint POST /viewActivityEvents
//@desc get all events associated with that park.
//@access PRIVATE - will need to validate token? YES
const handleCurrentEventParticipants = async (req, res, next) => {

    let participantId = req.params.participantId
    try {
        const db = getConnection().db(dbName)
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
}
//@endpoint GET /selectedParkEvents
//@desc get all events associated with the selected park.
//@access PRIVATE - will need to validate token? YES
//NOTES - CHECK HANDLEGETEVENTS
const handleSelectedParkEvents = async (req, res, next) => {

    let parkId = req.params.parkId;
    //connect to db
    try {
        const db = getConnection().db(dbName)
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
}

module.exports = {
    handleGetEvents, handleUserEvents,
    handleViewActivityEvents,
    handleCurrentEventParticipants,
    handleSelectedParkEvents,
}