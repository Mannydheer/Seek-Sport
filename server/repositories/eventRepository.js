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

const getParticipantDataRepo = async (participants) => {
  const db = getConnection().db(dbName);
  //In the participants collection, find all the documents that ids equal to the participant array passed.
  return await db
    .collection(collectionParticipants)
    .find({ _id: { $in: participants } })
    .toArray();
};

module.exports = {
  getAllEventsRepo,
  getEventsAssociatedWithUserRepo,
  getParticipantDataRepo,
};
