"use strict";

//MONGODB
const { getConnection } = require("../connection/connection");
const dbName = "ParkGames";
const collectionEvents = "Events";
const collectionParticipants = "Participants";
var ObjectId = require("mongodb").ObjectID;

const getAllEventsRepo = async () => {
  const db = getConnection().db(dbName);
  return await db.collection(collectionEvents).find().toArray();
};

module.exports = { getAllEventsRepo };
