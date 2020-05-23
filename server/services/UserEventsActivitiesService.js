const {
  getUserFromUserEventsRepo,
  getAllEventsUserRegisteredForRepo,
} = require("../repositories/UserEventsActivitiesRepository");
var ObjectId = require("mongodb").ObjectID;

const getUserFromUserEvents = async (userId) => {
  let userData = await getUserFromUserEventsRepo(userId);
  if (userData) {
    return userData;
  }
  return;
};

const allEventsArray = (userData) => {
  let allEvents = [];
  userData.events.forEach((event) => {
    allEvents.push(ObjectId(event));
  });
  return allEvents;
};

const getAllEventsUserRegisteredFor = async (allEvents) => {
  let eventData = await getAllEventsUserRegisteredForRepo(allEvents);
  if (eventData.length > 0) {
    return eventData;
  }
  return;
};

const filterEventData = (eventData, userId) => {
  let filteredEvents = eventData.filter((event) => {
    if (event.userId !== userId) {
      return event;
    }
  });
  console.log(filteredEvents, "filtered events");
  if (filteredEvents) {
    return filteredEvents;
  }
  return;
};

module.exports = {
  getUserFromUserEvents,
  allEventsArray,
  getAllEventsUserRegisteredFor,
  filterEventData,
};
