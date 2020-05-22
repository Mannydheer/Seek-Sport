const { getConnection } = require("../connection/connection");
//env vairables
require("dotenv").config();

const {
  getEventByIdRepo,
  getParticipantsByIdRepo,
  addParticipantRepo,
  addUserEventRepo,
  removeParticipantRepo,
  removeUserEventRepo,
} = require("../repositories/joinLeaveCancelRepository");

//------------------SERVICE-----------------------
// the brains of the application, they control any payload manipulation/validation
//---------------------------------------------------

//-----------------------------handleJoinEvent--------------------------------
//get a user by _id in the user collection.
const getEventById = async (eventId) => {
  // //grab the event
  const checkForEvent = await getEventByIdRepo(eventId);
  if (!checkForEvent) {
    return;
  }
  return checkForEvent;
};

//getParticipants for that selected event.
const getParticipantsById = async (eventParticipantId) => {
  const getParticipants = await getParticipantsByIdRepo(eventParticipantId);
  if (!getParticipants) {
    return;
  }
  return getParticipants;
};

//find matching participant
const getMatchingParticipant = (getParticipants, participantUserId) => {
  return getParticipants.participants.find((participant) => {
    if (participant.userId === participantUserId) {
      return participant;
    } else return;
  });
};

//add a participant if no match meaning he is not yet a partciiapnt.

const addParticipant = async (eventParticipantId, participantDetails) => {
  let updatedParticipant = await addParticipantRepo(
    eventParticipantId,
    participantDetails
  );
  if (
    updatedParticipant.matchedCount === 1 &&
    updatedParticipant.modifiedCount === 1
  ) {
    return updatedParticipant;
  }
  return;
};
const removeParticipant = async (
  eventParticipantId,
  participantDetailsUserId
) => {
  let updatedParticipantWithRemoval = await removeParticipantRepo(
    eventParticipantId,
    participantDetailsUserId
  );
  if (
    updatedParticipantWithRemoval.matchedCount === 1 &&
    updatedParticipantWithRemoval.modifiedCount === 1
  ) {
    return updatedParticipantWithRemoval;
  }
  return;
};

const addUserEvent = async (
  participantDetailsUserId,
  participantDetailsEventId
) => {
  let addedUserEvent = await addUserEventRepo(
    participantDetailsUserId,
    participantDetailsEventId
  );
  if (addedUserEvent.matchedCount === 1 && addedUserEvent.modifiedCount === 1) {
    return addedUserEvent;
  }
  return;
};
const removeUserEvent = async (
  participantDetailsUserId,
  participantDetailsEventId
) => {
  let removedUserEvent = await removeUserEventRepo(
    participantDetailsUserId,
    participantDetailsEventId
  );
  if (
    removedUserEvent.matchedCount === 1 &&
    removedUserEvent.modifiedCount === 1
  ) {
    return removedUserEvent;
  }
  return;
};

//-----------------------------handleLeaveEvent--------------------------------

module.exports = {
  getEventById,
  getParticipantsById,
  getMatchingParticipant,
  addParticipant,
  addUserEvent,
  removeParticipant,
  removeUserEvent,
};
