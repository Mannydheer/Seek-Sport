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

// //@endpoint POST /leaveEvent
// //@desc leave the event selected from ViewActivity comp.
// //@access PRIVATE - will need to validate token? YES
// const handleLeaveEvent = async (req, res, next) => {
//   const participantDetails = req.body.participantDetails;
//   const eventInformation = req.body.eventInformation;
//   try {
//     const db = getConnection().db(dbName);
//     // //grab the event
//     await db
//       .collection(collectionEvents)
//       .findOne({ _id: ObjectId(eventInformation._id) });
//     //now you have the participant ID.
//     //now get all the participants related to that event.
//     //removing participants
//     //find the participant collect from the event ParticipantId key.
//     //now within that, remove the participant
//     let updateParticipant = await db
//       .collection(collectionParticipants)
//       .updateOne(
//         { _id: ObjectId(eventInformation.participantId) },
//         { $pull: { participants: { userId: participantDetails.userId } } }
//       );

//     assert(1, updateParticipant.matchedCount);
//     assert(1, updateParticipant.modifiedCount);

//     //must also remove your event from the UserEvents collection.
//     let removeUserEvent = await db
//       .collection(collectionUserEvents)
//       .updateOne(
//         { _id: ObjectId(participantDetails.userId) },
//         { $pull: { events: eventInformation._id } }
//       );

//     assert(1, removeUserEvent.matchedCount);
//     assert(1, removeUserEvent.modifiedCount);
//     res
//       .status(200)
//       .json({ status: 200, message: "Successfully left the event!" });
//   } catch (error) {
//     console.log(error.stack, "Catch Error in handleLeaveEvent");
//     res.status(500).json({ status: 500, message: error.message });
//   }
// };

//@endpoint POST /cancelEvent
//@desc cancel the event selected
//@access PRIVATE - will need to validate token? YES
const handleCancelEvent = async (req, res, next) => {
  const eventId = req.body.eventId;
  try {
    const db = getConnection().db(dbName);
    let eventInfo = await db
      .collection(collectionEvents)
      .findOne({ _id: ObjectId(eventId) });
    let participantId = eventInfo.participantId;

    //delete room.
    let deleteRoom = await db
      .collection(collectionRooms)
      .deleteOne({ _id: `${eventId}-Room-1` });
    assert(1, deleteRoom.deletedCount);

    //delete event
    let deletedEvent = await db
      .collection(collectionEvents)
      .deleteOne({ _id: ObjectId(eventId) });
    assert(1, deletedEvent.deletedCount);
    //pseudo
    //also must remove all users that were registered for this event.
    //since we have the eventId... we can get the participantId and find the participants from the participant collection.
    //now we have access to all the userIds from each participants.
    //now for each user, we need to find the event being canceled in their array and delete it.
    //now we need to find all users from the collectionUserEvents and delete the event.

    //now we have the participants.
    let getParticipants = await db
      .collection(collectionParticipants)
      .findOne({ _id: ObjectId(participantId) });
    //we get an array.
    await getParticipants.participants.forEach(async (participant) => {
      let removeUserEvent = await db
        .collection(collectionUserEvents)
        .findOneAndUpdate(
          { _id: ObjectId(participant.userId) },
          { $pull: { events: ObjectId(eventId) } }
        );
    });

    //deleted participants.
    let deletedParticipants = await db
      .collection(collectionParticipants)
      .deleteOne({ _id: ObjectId(participantId) });
    console.log(deletedParticipants.deletedCount);
    assert(1, deletedParticipants.deletedCount);
    res
      .status(200)
      .json({ status: 200, message: "Successfully canceled the event!" });
  } catch (error) {
    console.log(error.stack, "Catch Error in handleCancelEvent");
    res.status(500).json({ status: 500, message: error.message });
  }
};

module.exports = {
  // handleJoinEvent,
  // handleLeaveEvent,
  handleCancelEvent,
};
