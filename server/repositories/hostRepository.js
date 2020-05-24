"use strict";

const { getConnection } = require("../connection/connection");

const dbName = "ParkGames";
const collectionHosts = "Hosts";
const collectionEvents = "Events";
const collectionParticipants = "Participants";
const collectionUserEvents = "UserEvents";
const collectionRooms = "Rooms";

const assert = require("assert");
var ObjectId = require("mongodb").ObjectID;

const getHostRepo = async (hostUserId) => {
  const db = getConnection().db(dbName);
  return await db.collection(collectionHosts).findOne({ userId: hostUserId });
};

module.exports = { getHostRepo };
