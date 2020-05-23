"use strict";

//MONGODB
const { getConnection } = require("../connection/connection");

const dbName = "ParkGames";
const collectionEvents = "Events";
const collectionUserEvents = "UserEvents";
var ObjectId = require("mongodb").ObjectID;

const {
  getUserFromUserEvents,
} = require("../services/UserEventsActivitiesService");

//@endpoint GET /userActivities
//@desc get all events that the user joined
//@access PRIVATE - will need to validate token? YES
const handleUserActivities = async (req, res, next) => {
  try {
    let userId = req.params.userId;
    if (!userId) {
      return;
    }
    let userData = await getUserFromUserEvents(userId);
    if (!userData) {
      return;
    }
    // const db = getConnection().db(dbName);
    // let userData = await db
    //   .collection(collectionUserEvents)
    //   .findOne({ _id: ObjectId(userId) });
    //if you have never signed up for any events yet.
    if (!userData.events) {
      res.status(400).json({
        status: 400,
        message:
          "Seems like you are new, you may head to the home page to find activities or talk to our chatbot!",
      });
    } else {
      //if you registered for events.
      let allEvents = [];
      userData.events.forEach((event) => {
        allEvents.push(ObjectId(event));
      });
      let eventData = await db
        .collection(collectionEvents)
        .find({ _id: { $in: allEvents } })
        .toArray();
      if (eventData.length > 0) {
        let filteredEventData = eventData.filter((event) => {
          if (event.userId !== userId) {
            return event;
          }
        });
        res.status(200).json({
          status: 200,
          message: "Success getting all events you have registered for!",
          events: filteredEventData,
        });
      } else {
        res.status(400).json({
          status: 400,
          message:
            "Seems like you have no registered to any events! Head to the home page to find activities!",
        });
      }
      //find all the events that you have registered for.
    }
  } catch (error) {
    console.log(error.stack, "Catch Error in handleSelectedParkEvents");
    res.status(500).json({ status: 500, message: error.message });
  }
};

module.exports = { handleUserActivities };
