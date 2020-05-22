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

const addParticipantRepo = async (eventParticipantId, participantDetails) => {
  const db = getConnection().db(dbName);

  return await db
    .collection(collectionParticipants)
    .updateOne(
      { _id: ObjectId(eventParticipantId) },
      { $push: { participants: participantDetails } }
    );
};

//handleLeaveEvent - remove a participant.
const removeParticipantRepo = async (
  eventParticipantId,
  participantDetailsUserId
) => {
  const db = getConnection().db(dbName);

  return await db
    .collection(collectionParticipants)
    .updateOne(
      { _id: ObjectId(eventParticipantId) },
      { $pull: { participants: { userId: participantDetailsUserId } } }
    );
};

const addUserEventRepo = async (
  participantDetailsUserId,
  participantDetailsEventId
) => {
  const db = getConnection().db(dbName);

  return await db
    .collection(collectionUserEvents)
    .updateOne(
      { _id: ObjectId(participantDetailsUserId) },
      { $push: { events: participantDetailsEventId } }
    );
};

const removeUserEventRepo = async (
  participantDetailsUserId,
  participantDetailsEventId
) => {
  const db = getConnection().db(dbName);
  return await db
    .collection(collectionUserEvents)
    .updateOne(
      { _id: ObjectId(participantDetailsUserId) },
      { $pull: { events: ObjectId(participantDetailsEventId) } }
    );
};

const deletedRoomRepo = async (eventId) => {
  const db = getConnection().db(dbName);
  return await db
    .collection(collectionRooms)
    .deleteOne({ _id: `${eventId}-Room-1` });
};
const deletedEventRepo = async (eventId) => {
  const db = getConnection().db(dbName);
  return await db
    .collection(collectionEvents)
    .deleteOne({ _id: ObjectId(eventId) });
};

const deleteParticipantsRepo = async (participantId) => {
  const db = getConnection().db(dbName);
  return db.collection(collectionParticipants).deleteOne({
    _id: ObjectId(participantId),
  });
};

module.exports = {
  getEventByIdRepo,
  getParticipantsByIdRepo,
  addParticipantRepo,
  addUserEventRepo,
  removeParticipantRepo,
  removeUserEventRepo,
  deletedRoomRepo,
  deleteParticipantsRepo,
  deletedEventRepo,
};
