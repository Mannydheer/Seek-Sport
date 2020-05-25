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

const filterEventsRelatedToHostAtSamePark = (allEvents, eventInformation) => {
  let filteredEvents = allEvents.filter((event) => {
    if (event.parkId === eventInformation.parkId) {
      return event;
    }
  });
  if (filteredEvents.length === 0) {
    return;
  }
  return filteredEvents;
};
const filterEventsRelatedToHostAtDifferentPark = (
  allEvents,
  eventInformation
) => {
  let filteredEventsAllParks = allEvents.filter((event) => {
    if (event.parkId !== eventInformation.parkId) {
      return event;
    }
  });
  if (filteredEventsAllParks.length === 0) {
    return;
  }
  return filteredEventsAllParks;
};

const validateBookings = (
  filteredEventsAllParks,
  startDate,
  duration,
  eventInformation
) => {
  //---------------------TIME ----------------------------
  let d = new Date();
  //get the currentMinutes - live time.
  let currentMinutes = d.getHours() * 60 + d.getMinutes();
  // get the time in minutes that the person tried booked.
  let startMinutes =
    new Date(startDate).getHours() * 60 + new Date(startDate).getMinutes();
  // convert the duration to minutes.
  let durationMinutes = parseInt(duration) * 60;
  // get the end minutes (duration + the start.)
  let endMinutes = startMinutes + durationMinutes;
  //NOW we need to check if any of the other park times are WITHIN these times.
  //this will be a range ...
  //if so ... then there is a conflict.
  let check;

  filteredEventsAllParks.forEach((event) => {
    //for each event, grab the start time.
    //NOW we get the range for the starting and ending time of each of the events.
    //now we will check...
    //if the start time of the event is within the range of the current event time,
    //or if the end time is within that range...
    //then there is a conflict.
    //we will check for each of the events.
    let eventStartTime =
      new Date(event.time).getHours() * 60 + new Date(event.time).getMinutes();
    let eventEndTime = event.duration * 60 + eventStartTime;
    //see if the start time is within the start-end time for the current booking.
    //checking if start minutes is within the event range and if the end minutes is within the range.
    //if one of them are true... then there is a time conflict.
    if (
      (startMinutes <= eventEndTime && startMinutes >= eventStartTime) ||
      (endMinutes <= eventEndTime && endMinutes >= eventStartTime)
    ) {
      if (event.bookedDate === eventInformation.bookedDate) {
        check = event;
      } else {
        //if there are no time conflicts
        check = null;
      }
    }
    //if there wasnt any time conflicts, set bool of first test to true.
    else {
      check = null;
    }
  });
  return check;
};

module.exports = {
  getHost,
  createNewHost,
  createNewEvent,
  addAsParticipant,
  updateParticipantId,
  createRoom,
  getEventsRelatedToHost,
  filterEventsRelatedToHostAtSamePark,
  filterEventsRelatedToHostAtDifferentPark,
  validateBookings,
};
