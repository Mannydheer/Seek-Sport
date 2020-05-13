'use strict';

//MONGODB
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://dbUser:YOFwbi6x3P5o3H4d@cluster0-seh3x.mongodb.net/test?authSource=admin&replicaSet=Cluster0-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true"
const dbName = 'ParkGames';
const collectionEvents = 'Events'
const collectionParticipants = 'Participants'
const collectionUserEvents = 'UserEvents'
const collectionRooms = 'Rooms'

const assert = require('assert')
var ObjectId = require('mongodb').ObjectID;

//env vairablkes
require('dotenv').config();

//@endpoint POST /joinEvent
//@desc join the event selected from ViewActivity comp.
//@access PRIVATE - will need to validate token? YES
const handleJoinEvent = async (req, res, next) => {

    const participantDetails = req.body.participantDetails
    const eventInformation = req.body.eventInformation

    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    //dsfsdfasddsa
    //connect to db
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in handleJoinEvent")
        try {
            const db = client.db(dbName)
            // //grab the event
            let getEvent = await db.collection(collectionEvents).findOne({ _id: ObjectId(eventInformation._id) })
            //see if there is a participant ID in that event. If so then there are at least 1 participant.
            //if there is a participant ID.
            //check if that participant doesnt already exist... in that event. 
            let getParticipants = await db.collection(collectionParticipants)
                .findOne({ _id: ObjectId(getEvent.participantId) })
            //if you get participants. Which you will 100% because if you have a apeticipant ID then there are participants
            //Look at if case just before.
            if (getParticipants) {
                //check if any of the participants in the array match the current participant trying to join.
                let existingParticipant = getParticipants.participants.find(participant => {
                    if (participant.userId == participantDetails.userId) {
                        return true
                    }
                })
                //if they do match...
                if (existingParticipant) {
                    res.status(400).json({ status: 400, message: "You are already registered in this event." })
                }
                else {
                    //if you don't find a matching participant.
                    //add the incoming participant to that.
                    //adding participants
                    let updateParticipant = await db.collection(collectionParticipants).updateOne({ _id: ObjectId(eventInformation.participantId) }, { $push: { participants: participantDetails } })
                    assert(1, updateParticipant.matchedCount)
                    assert(1, updateParticipant.modifiedCount)

                    //when signing up, you create a _id = to the userId in the collectionUserEvents.
                    //now we will push the event id in the array in this event to keep track of which events the user JOINED!
                    let addUserEvent = await db.collection(collectionUserEvents).updateOne({ _id: ObjectId(participantDetails.userId) }, { $push: { events: participantDetails.eventId } })
                    assert(1, addUserEvent.matchedCount)
                    assert(1, addUserEvent.modifiedCount)

                    res.status(200).json({ status: 200, message: "Successfully joined the event!" })
                }
            }

        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleJoinEvent')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}

//@endpoint POST /leaveEvent
//@desc leave the event selected from ViewActivity comp.
//@access PRIVATE - will need to validate token? YES
const handleLeaveEvent = async (req, res, next) => {

    const participantDetails = req.body.participantDetails
    const eventInformation = req.body.eventInformation

    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    //dsfsdfasddsa
    //connect to db
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in handleJoinEvent")
        try {
            const db = client.db(dbName)
            // //grab the event
            await db.collection(collectionEvents).findOne({ _id: ObjectId(eventInformation._id) })
            //now you have the participant ID.
            //now get all the participants related to that event.
            //removing participants
            //find the participant collect from the event ParticipantId key.
            //now within that, remove the participant
            let updateParticipant = await db.collection(collectionParticipants)
                .updateOne({ _id: ObjectId(eventInformation.participantId) }, { $pull: { participants: { userId: participantDetails.userId } } })

            assert(1, updateParticipant.matchedCount)
            assert(1, updateParticipant.modifiedCount)

            //must also remove your event from the UserEvents collection.
            let removeUserEvent = await db.collection(collectionUserEvents)
                .updateOne({ _id: ObjectId(participantDetails.userId) }, { $pull: { events: eventInformation._id } })

            assert(1, removeUserEvent.matchedCount)
            assert(1, removeUserEvent.modifiedCount)
            res.status(200).json({ status: 200, message: "Successfully left the event!" })
        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleLeaveEvent')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}

//@endpoint POST /cancelEvent
//@desc cancel the event selected 
//@access PRIVATE - will need to validate token? YES
const handleCancelEvent = async (req, res, next) => {
    const eventId = req.body.eventId
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    //dsfsdfasddsa
    //connect to db
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in handleCancelEvent")
        try {
            const db = client.db(dbName)
            let eventInfo = await db.collection(collectionEvents).findOne({ _id: ObjectId(eventId) })
            let participantId = eventInfo.participantId;

            //delete room.
            let deleteRoom = await db.collection(collectionRooms).deleteOne({ _id: `${eventId}-Room-1` })
            assert(1, deleteRoom.deletedCount)

            //delete event
            let deletedEvent = await db.collection(collectionEvents).deleteOne({ _id: ObjectId(eventId) })
            assert(1, deletedEvent.deletedCount)

            //pseudo
            //also must remove all users that were registered for this event. 
            //since we have the eventId... we can get the participantId and find the participants from the participant collection.
            //now we have access to all the userIds from each participants.
            //now for each user, we need to find the event being canceled in their array and delete it.
            //now we need to find all users from the collectionUserEvents and delete the event. 

            //now we have the participants.
            let getParticipants = await db.collection(collectionParticipants).findOne({ _id: ObjectId(participantId) })
            //we get an array.
            await getParticipants.participants.forEach(async (participant) => {
                let removeUserEvent = await db.collection(collectionUserEvents).findOneAndUpdate({ _id: ObjectId(participant.userId) }, { $pull: { events: ObjectId(eventId) } })
            })

            //deleted participants.
            let deletedParticipants = await db.collection(collectionParticipants).deleteOne({ _id: ObjectId(participantId) })
            console.log(deletedParticipants.deletedCount)
            assert(1, deletedParticipants.deletedCount)
            res.status(200).json({ status: 200, message: "Successfully canceled the event!" })
        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleCancelEvent')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}


module.exports = {
    handleJoinEvent,
    handleLeaveEvent,
    handleCancelEvent,

}