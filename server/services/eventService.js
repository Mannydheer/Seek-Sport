const { getAllEventsRepo } = require("../repositories/eventRepository");

const getAllEvents = async () => {
  let allEvents = await getAllEventsRepo();
  if (allEvents.length > 0) {
    return allEvents;
  }
  return;
};

module.exports = { getAllEvents };
