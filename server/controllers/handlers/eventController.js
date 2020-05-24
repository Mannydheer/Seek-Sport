"use strict";

//MONGODB
const { getConnection } = require("../../connection/connection");
const dbName = "ParkGames";
const collectionEvents = "Events";
const collectionParticipants = "Participants";
var ObjectId = require("mongodb").ObjectID;

const {
  getAllEvents,
  getEventsAssociatedWithUser,
  allParticipantsArray,
  getParticipantData,
  getEventsAssociatedWithPark,
} = require("../../services/eventService");

const {
  getParticipantsById,
} = require("../../services/joinLeaveCancelService");

//@endpoint GET /getEvents
//@desc all events on the map.
//@access PUBLIC
const handleGetEvents = async (req, res, next) => {
  try {
    let allEvents = await getAllEvents();
    if (allEvents) {
      return res.status(200).json({
        status: 200,
        message: "Success getting all events!",
        events: allEvents,
      });
    }
    return res
      .status(400)
      .json({ status: 400, message: "Unable to get all events." });
  } catch (error) {
    console.log(error.stack, "Catch Error in handleEvents");
    res.status(500).json({ status: 500, message: error.message });
  }
};

//@endpoint GET /userEvents/:_id
//@desc get events associated with current user logged in.
//@access PRIVATE - will need to validate token? YES
const handleUserEvents = async (req, res, next) => {
  try {
    const _id = req.params._id;
    if (!_id) {
      return res.status(400).json({ status: 400, message: "Missing id." });
    }
    let allData = await getEventsAssociatedWithUser(_id);
    if (!allData) {
      return res
        .status(404)
        .json({ status: 404, message: "There are no events booked." });
    }
    //function will push all participantId for each event into an array.
    let participants = await allParticipantsArray(allData);
    //this will return all participants for each event. Now there is access to all participants for each event the user is participanting in.
    let participantData = await getParticipantData(participants);
    if (!participantData) {
      return res.status(404).json({
        status: 404,
        message: "There are no participants for this event.",
      });
    }
    return res.status(200).json({
      status: 200,
      message:
        "Success getting all events & participants associated with the user!",
      events: allData,
      participants: participantData,
    });
  } catch (error) {
    console.log(error.stack, "Catch Error in handleUserevents");
    res.status(500).json({ status: 500, message: error.message });
  }
};

//@endpoint POST /currentEventParticipants/:participantId,
//@desc get all events associated with that park.
//@access PRIVATE - will need to validate token? YES
const handleCurrentEventParticipants = async (req, res, next) => {
  try {
    let participantId = req.params.participantId;

    if (!participantId) {
      return res
        .status(400)
        .json({ status: 400, message: "Missing participant Id." });
    }
    //insert the hosting info into DB
    let participantData = await getParticipantsById(participantId);
    if (!participantData) {
      return res.status(400).json({
        status: 400,
        message: "Currently no participants registered for this event.",
      });
    }
    return res.status(200).json({
      status: 200,
      message: "Success getting participants for single event.",
      eventParticipants: participantData.participants,
    });

    //
  } catch (error) {
    console.log(error.stack, "Catch Error in handleViewActivityevents");
    res.status(500).json({ status: 500, message: error.message });
  }
};

//@endpoint GET /selectedParkEvents
//@desc get all events associated with the selected park.
//@access PRIVATE - will need to validate token? YES
//NOTES - CHECK HANDLEGETEVENTS
const handleSelectedParkEvents = async (req, res, next) => {
  //connect to db
  try {
    let parkId = req.params.parkId;
    if (!parkId) {
      return res.status(400).json({ status: 400, message: "Missing park Id." });
    }
    // const db = getConnection().db(dbName);
    //insert the hosting info into DB
    let allEventsForAssociatedPark = await getEventsAssociatedWithPark(parkId);
    if (!allEventsForAssociatedPark) {
      return res
        .status(400)
        .json({ status: 400, message: "No events associated with this park." });
    }
    return res.status(200).json({
      status: 200,
      message: "Success getting all events for selected park!",
      events: allEventsForAssociatedPark,
    });
  } catch (error) {
    console.log(error.stack, "Catch Error in handleSelectedParkEvents");
    res.status(500).json({ status: 500, message: error.message });
  }
};

module.exports = {
  handleGetEvents,
  handleUserEvents,
  handleCurrentEventParticipants,
  handleSelectedParkEvents,
};
