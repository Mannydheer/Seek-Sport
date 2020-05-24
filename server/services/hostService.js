const { getHostRepo } = require("../repositories/hostRepository");

const getHost = async (hostUserId) => {
  let hostInfo = await getHostRepo(hostUserId);
  if (hostInfo) {
    return hostInfo;
  }
  return;
};

module.exports = { getHost };
