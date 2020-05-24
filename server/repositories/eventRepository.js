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

const getEventsAssociatedWithUserRepo = async (_id) => {
  const db = getConnection().db(dbName);
  return await db.collection(collectionEvents).find({ userId: _id }).toArray();
};

module.exports = { getAllEventsRepo, getEventsAssociatedWithUserRepo };
