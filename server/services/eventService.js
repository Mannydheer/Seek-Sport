const {
  getAllEventsRepo,
  getEventsAssociatedWithUserRepo,
} = require("../repositories/eventRepository");
var ObjectId = require("mongodb").ObjectID;

const getAllEvents = async () => {
  let allEvents = await getAllEventsRepo();
  if (allEvents.length > 0) {
    return allEvents;
  }
  return;
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

module.exports = {
  getAllEvents,
  getEventsAssociatedWithUser,
  allParticipantsArray,
};
