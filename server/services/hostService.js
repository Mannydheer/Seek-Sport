const {
  getHostRepo,
  createNewHostRepo,
  createNewEventRepo,
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
  let eventInfo = await createNewHostRepo(eventInformation);
  if (eventInfo.insertedCount === 1) {
    return eventInfo;
  }
  return;
};

module.exports = { getHost, createNewHost, createNewEvent };
