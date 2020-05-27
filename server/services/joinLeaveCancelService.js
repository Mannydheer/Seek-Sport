//env vairables
const {
  getEventByIdRepo,
  getParticipantsByIdRepo,
  addParticipantRepo,
  addUserEventRepo,
  removeParticipantRepo,
  removeUserEventRepo,
  deletedRoomRepo,
  deleteParticipantsRepo,
  deletedEventRepo,
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
    }
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

//------------------------handleCancelEvent-----------------------

const deleteRoom = async (eventId) => {
  let deletedRoom = await deletedRoomRepo(eventId);
  if (deletedRoom.deletedCount === 1) {
    return deletedRoom;
  }
  return;
};
const deleteEvent = async (eventId) => {
  let deletedEvent = await deletedEventRepo(eventId);
  if (deletedEvent.deletedCount === 1) {
    return deletedEvent;
  }
  return;
};

const deleteParticipants = async (participantsId) => {
  let deletedParticipants = await deleteParticipantsRepo(participantsId);
  if (deletedParticipants.deletedCount === 1) {
    return deletedParticipants;
  }
  return;
};

module.exports = {
  getEventById,
  getParticipantsById,
  getMatchingParticipant,
  addParticipant,
  addUserEvent,
  removeParticipant,
  removeUserEvent,
  deleteRoom,
  deleteParticipants,
  deleteEvent,
};
