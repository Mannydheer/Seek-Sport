const {
  getHostRepo,
  createNewHostRepo,
  createNewEventRepo,
  addAsParticipantRepo,
  updateParticipantIdRepo,
  createRoomRepo,
  getEventsRelatedToHostRepo,
} = require("../repositories/hostRepository");

const getHost = async (hostUserId) => {
  let hostInfo = await getHostRepo(hostUserId);
  if (hostInfo) {
    return hostInfo;
  }
  return;
};

const createNewHost = async (hostingInformation) => {
  let hostInserted = await createNewHostRepo(hostingInformation);
  if (hostInserted.insertedCount === 1) {
    return hostInserted;
  }
  return;
};

const createNewEvent = async (eventInformation) => {
  let eventInfo = await createNewEventRepo(eventInformation);
  if (eventInfo.insertedCount === 1) {
    return eventInfo;
  }
  return;
};

const addAsParticipant = async (hostingInformation) => {
  let participantAdded = await addAsParticipantRepo(hostingInformation);
  if (participantAdded.insertedCount === 1) {
    return participantAdded;
  }
  return;
};

const updateParticipantId = async (eventId, participantId) => {
  let updated = await updateParticipantIdRepo(eventId, participantId);
  if (updated.modifiedCount === 1 && updated.matchedCount === 1) {
    return updated;
  }
  return;
};

const createRoom = async (eventId, participantId) => {
  let roomAdded = await createRoomRepo(eventId, participantId);
  if (roomAdded.insertedCount === 1) {
    return roomAdded;
  }
  return;
};

const getEventsRelatedToHost = async (hostUserId, eventBookedDate) => {
  let allEvents = await getEventsRelatedToHostRepo(hostUserId, eventBookedDate);
  if (allEvents.length > 0) {
    return allEvents;
  }
  return;
};

module.exports = {
  getHost,
  createNewHost,
  createNewEvent,
  addAsParticipant,
  updateParticipantId,
  createRoom,
  getEventsRelatedToHost,
};
