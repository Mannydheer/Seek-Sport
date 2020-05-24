const {
  getAllEventsRepo,
  getEventsAssociatedWithUserRepo,
} = require("../repositories/eventRepository");

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

module.exports = { getAllEvents, getEventsAssociatedWithUser };
