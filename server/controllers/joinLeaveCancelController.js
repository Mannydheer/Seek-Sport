"use strict";

const dbName = "ParkGames";
const collectionEvents = "Events";
const collectionParticipants = "Participants";
const collectionUserEvents = "UserEvents";
const collectionRooms = "Rooms";
const assert = require("assert");
var ObjectId = require("mongodb").ObjectID;
const { getConnection } = require("../connection/connection");
//env vairables
require("dotenv").config();
const {
  getEventById,
  getParticipantsById,
} = require("../services/joinLeaveCancelService");

//@endpoint POST /joinEvent
//@desc join the event selected from ViewActivity component.
//@access PRIVATE - will need to validate token? YES
const handleJoinEvent = async (req, res, next) => {
  const participantDetails = req.body.participantDetails;
  const eventInformation = req.body.eventInformation;
  try {
    //get the event.
    let getEvent = await getEventById(eventInformation._id);
    //see if there is a participant ID in that event. If so then there are at least 1 participant.
    //if there is a participant ID.
    //check if that participant doesnt already exist... in that event.
    let getParticipants = await getParticipantsById(getEvent.participantId);
    //if you get participants. Which you will 100% because if you have a apeticipant ID then there are participants
    //Look at if case just before.
    if (getParticipants) {
      //check if any of the participants in the array match the current participant trying to join.
      let existingParticipant = getParticipants.participants.find(
        (participant) => {
          if (participant.userId == participantDetails.userId) {
            return true;
          }
        }
      );
      //if they do match...
      if (existingParticipant) {
        res.status(400).json({
          status: 400,
          message: "You are already registered in this event.",
        });
      } else {
        //if you don't find a matching participant.
        //add the incoming participant to that.
        //adding participants
        let updateParticipant = await db
          .collection(collectionParticipants)
          .updateOne(
            { _id: ObjectId(eventInformation.participantId) },
            { $push: { participants: participantDetails } }
          );
        assert(1, updateParticipant.matchedCount);
        assert(1, updateParticipant.modifiedCount);

        //when signing up, you create a _id = to the userId in the collectionUserEvents.
        //now we will push the event id in the array in this event to keep track of which events the user JOINED!
        let addUserEvent = await db
          .collection(collectionUserEvents)
          .updateOne(
            { _id: ObjectId(participantDetails.userId) },
            { $push: { events: participantDetails.eventId } }
          );
        assert(1, addUserEvent.matchedCount);
        assert(1, addUserEvent.modifiedCount);

        res
          .status(200)
          .json({ status: 200, message: "Successfully joined the event!" });
      }
    }
  } catch (error) {
    console.log(error.stack, "Catch Error in handleJoinEvent");
    res.status(500).json({ status: 500, message: error.message });
  }
};

module.exports = { handleJoinEvent };
