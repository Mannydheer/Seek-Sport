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

const createNewHostRepo = async (hostingInformation) => {
  const db = getConnection().db(dbName);
  return await db.collection(collectionHosts).insertOne(hostingInformation);
};

const createNewEventRepo = async (eventInformation) => {
  const db = getConnection().db(dbName);
  return await db.collection(collectionEvents).insertOne(eventInformation);
};

const addAsParticipantRepo = async (hostingInformation) => {
  const db = getConnection().db(dbName);
  return await db
    .collection(collectionParticipants)
    .insertOne({ participants: [hostingInformation] });
};

const updateParticipantIdRepo = async (eventId, participantId) => {
  const db = getConnection().db(dbName);
  return await db
    .collection(collectionEvents)
    .updateOne(
      { _id: ObjectId(eventId) },
      { $set: { participantId: participantId } }
    );
};

const createRoomRepo = async (eventId, participantId) => {
  const db = getConnection().db(dbName);
  return await db.collection(collectionRooms).insertOne({
    _id: `${eventId}-Room-1`,
    participantId: participantId,
    chatParticipants: [],
  });
};

module.exports = {
  getHostRepo,
  createNewHostRepo,
  createNewEventRepo,
  addAsParticipantRepo,
  updateParticipantIdRepo,
  createRoomRepo,
};
