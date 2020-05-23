const {
  getUserFromUserEventsRepo,
} = require("../repositories/UserEventsActivitiesRepository");

const getUserFromUserEvents = async (userId) => {
  let userData = await getUserFromUserEventsRepo(userId);
  if (userData) {
    return userData;
  }
  return;
};

module.exports = { getUserFromUserEvents };
