const {
  getAllEventsRepo,
  getEventsAssociatedWithUserRepo,
  getParticipantDataRepo,
  getEventsAssociatedWithParkRepo,
} = require("../repositories/eventRepository");
var ObjectId = require("mongodb").ObjectID;

const getAllEvents = async () => {
  let allEvents = await getAllEventsRepo();
  return allEvents;
};

const getEventsAssociatedWithUser = async (_id) => {
  let eventData = await getEventsAssociatedWithUserRepo(_id);
  if (eventData.length > 0) {
    return eventData;
  }
  return;
};

const allParticipantsArray = (allData) => {
  let allParticipants = [];
  allData.forEach((data) => {
    allParticipants.push(ObjectId(data.participantId));
  });
  return allParticipants;
};

const getParticipantData = async (participants) => {
  let participantData = await getParticipantDataRepo(participants);
  if (participantData.length > 0) {
    return participantData;
  }
  return;
};

const getEventsAssociatedWithPark = async (parkId) => {
  let parkEvents = await getEventsAssociatedWithParkRepo(parkId);
  if (parkEvents.length > 0) {
    return parkEvents;
  }
  return;
};

module.exports = {
  getAllEvents,
  getEventsAssociatedWithUser,
  allParticipantsArray,
  getParticipantData,
  getEventsAssociatedWithPark,
};
