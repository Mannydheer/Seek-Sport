"use strict";

//MONGODB
const { getConnection } = require("../connection/connection");

const dbName = "ParkGames";
const collectionEvents = "Events";
const collectionUserEvents = "UserEvents";
var ObjectId = require("mongodb").ObjectID;

const {
  getUserFromUserEvents,
  allEventsArray,
  getAllEventsUserRegisteredFor,
  filterEventData,
} = require("../services/UserEventsActivitiesService");

//@endpoint GET /userActivities
//@desc get all events that the user joined
//@access PRIVATE - will need to validate token? YES
const handleUserActivities = async (req, res, next) => {
  try {
    const db = getConnection().db(dbName);

    let userId = req.params.userId;
    if (!userId) {
      return;
    }
    let userData = await getUserFromUserEvents(userId);
    //if you have never signed up for any events yet.
    if (!userData.events) {
      return res.status(400).json({
        status: 400,
        message:
          "Seems like you are new, you may head to the home page to find activities or talk to our chatbot!",
      });
    }
    //if you registered for events.
    let allEvents = allEventsArray(userData);
    let eventData = await getAllEventsUserRegisteredFor(allEvents);
    if (!eventData) {
      return;
    }
    let filteredEventData = filterEventData(eventData);
    if (filteredEventData) {
      return res.status(200).json({
        status: 200,
        message: "Success getting all events you have registered for!",
        events: filteredEventData,
      });
    }
    return res.status(400).json({
      status: 400,
      message:
        "Seems like you have no registered to any events! Head to the home page to find activities!",
    });

    //find all the events that you have registered for.
  } catch (error) {
    console.log(error.stack, "Catch Error in handleSelectedParkEvents");
    res.status(500).json({ status: 500, message: error.message });
  }
};

module.exports = { handleUserActivities };
