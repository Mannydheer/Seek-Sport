"use strict";

const dbName = "ParkGames";
const collectionEvents = "Events";
const collectionParticipants = "Participants";
const collectionUserEvents = "UserEvents";
const collectionRooms = "Rooms";
const assert = require("assert");
var ObjectId = require("mongodb").ObjectID;
const { getConnection } = require("../connection/connection");

const getEventByIdRepo = async (eventId) => {
  const db = getConnection().db(dbName);
  return await db
    .collection(collectionEvents)
    .findOne({ _id: ObjectId(eventId) });
};

const getParticipantsByIdRepo = async (eventParticipantId) => {
  const db = getConnection().db(dbName);
  return await db
    .collection(collectionParticipants)
    .findOne({ _id: ObjectId(eventParticipantId) });
};
module.exports = { getEventByIdRepo, getParticipantsByIdRepo };
