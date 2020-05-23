"use strict";

//MONGODB
const { getConnection } = require("../connection/connection");

const dbName = "ParkGames";
const collectionEvents = "Events";
const collectionUserEvents = "UserEvents";
var ObjectId = require("mongodb").ObjectID;

const getUserFromUserEventsRepo = async (userId) => {
  const db = getConnection().db(dbName);
  return await db
    .collection(collectionUserEvents)
    .findOne({ _id: ObjectId(userId) });
};
const getAllEventsUserRegisteredForRepo = async (allEvents) => {
  return await db
    .collection(collectionEvents)
    .find({ _id: { $in: allEvents } })
    .toArray();
};

module.exports = {
  getUserFromUserEventsRepo,
  getAllEventsUserRegisteredForRepo,
};
