"use strict";
const dbName = "ParkGames";
const collectionEvents = "Events";
const collectionParticipants = "Participants";
const { getConnection } = require("../../connection/connection");

var ObjectId = require("mongodb").ObjectID;
//env vairablkes
require("dotenv").config();

//@endpoint GET /getChatRoom
//@desc get chat room ID for specified EVENT.
//@access PRIVATE - will need to validate token? YES - add...
const handleGetChatRoom = async (req, res, next) => {
  const eventId = req.params.eventId;
  try {
    const db = getConnection().db(dbName);
    let eventData = await db
      .collection(collectionEvents)
      .findOne({ _id: ObjectId(eventId) });
    //since we are making a participant ID as soon as we host an event.
    //so check if there is no event.
    if (!eventData) {
      res.status(404).json({ status: 404, message: "There are no events." });
    } else {
      let participantData = await db
        .collection(collectionParticipants)
        .findOne({ _id: ObjectId(eventData.participantId) });
      //since the participantId is the room ID...
      res.status(200).json({
        status: 200,
        message:
          "Success getting participantID events associated with the event.",
        participantId: eventData.participantId,
        eventParticipants: participantData.participants,
      });
    }
  } catch (error) {
    console.log(error.stack, "Catch Error in handleGetChatRoom ");
    res.status(500).json({ status: 500, message: error.message });
  }
};

module.exports = {
  handleGetChatRoom,
};
