const {
  getUserFromUserEventsRepo,
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

module.exports = { getUserFromUserEvents, allEventsArray };
