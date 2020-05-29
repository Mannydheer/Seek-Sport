"use strict";
const {
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
  getAllHosts,
} = require("../../services/hostService");

const { addUserEvent } = require("../../services/joinLeaveCancelService");
const {
  NotFoundError,
  BadRequestError,
  UnprocessableEntity,
} = require("../../utils/errors");

//@endpoint POST /hostingInformation
//@desc store the info into the database of the reservating
//@access PRIVATE - will need to validate token? YES

// ------------------- HOSTING ---------------------
const handleHosting = async (req, res, next) => {
  //pseudocode for time coonflicts.
  //first find all the events associated with that USERID and at the SAME PARK.
  //if there are none, everything passes and you can book at that park.
  //if found, loop through their events at that park and check if there are any time clashes.
  //if time clashes send back message saying you have already booked at that time.
  //connect to db
  try {
    let hostingInformation = req.body.hostingInformation;
    let eventInformation = req.body.eventInformation;
    let startDate = eventInformation.time;
    let duration = eventInformation.duration;
    if (!hostingInformation || !eventInformation || !startDate || !duration) {
      throw new BadRequestError(
        "Missing information in order to host in handleHosting."
      );
    }
    //first see if the host already exists.
    let findhost = await getHost(hostingInformation.userId);
    let validBooking = false;
    let validBookingAllEvents = false;
    //if you dont find a host.
    //will only run once... see if you can refactor this..
    if (!findhost) {
      //make a new host because there are no event related to this host.
      //insert the hosting info into DB
      let hostInserted = await createNewHost(hostingInformation);
      //give the event key the refernece to the hostId.
      //data.ops[0]._id is the hosts object ID.
      eventInformation.hostId = hostInserted.ops[0]._id;

      let createEvent = await createNewEvent(eventInformation);
      let eventId = createEvent.ops[0]._id;
      if (!eventId) {
        throw new NotFoundError(
          "No event Id from createEvent variable in handleHost."
        );
      }
      //insert as participant.
      //then we need to make the host a participant as well.
      //also since this will only happen once, will add also the host information as a participant.
      //push the details of the participant a document.
      hostingInformation.parkId = eventInformation.parkId;
      let addParticipant = await addAsParticipant(hostingInformation);
      //then assign the event with that participants Id object
      let participantId = addParticipant.ops[0]._id;
      if (!participantId) {
        throw new NotFoundError(
          "No participant Id from participantId variable in handleHost."
        );
      }
      await updateParticipantId(eventId, participantId);
      await createRoom(eventId, participantId);
      await addUserEvent(hostingInformation.userId, eventId);
      return res.status(200).json({
        status: 200,
        message:
          "New Host Reservation successful. Thanks for booking! Also you were added as a participant",
        hostingInformation: hostingInformation,
      });

      // });
    }
    //if a matching host is found in the Hosts collection.
    else {
      //if a host exists, you can get all events related to that host.
      //find all events related to the host.
      //allEvents will get ALL THE EVENTS of that user... or host on the day he is trying to host.
      let allEvents = await getEventsRelatedToHost(
        hostingInformation.userId,
        eventInformation.bookedDate
      );
      if (!allEvents) {
        //if you don't have anything, then there are no issues booking.
        validBooking = true;
        validBookingAllEvents = true;
      }
      //if there are events under this host
      else {
        //allEvents only has the events related to the current host...
        //filter the events that are held at the CURRENT park at which the host is trying to book.
        let filteredEvents = filterEventsRelatedToHostAtSamePark(
          allEvents,
          eventInformation
        );
        //filter and get back all the events related to that host at ANY park.
        //EXCLUDING the current park.
        //this is so we can seperate the messages we want to send back to the front end.
        //if its an error due to the same park or due to another park.
        let filteredEventsAllParks = filterEventsRelatedToHostAtDifferentPark(
          allEvents,
          eventInformation
        );
        //if current host has not booked any events at any other park...
        //if this passes then first bool text passes so there arnt any time conflicts from any other events at any park.
        if (!filteredEventsAllParks) {
          validBookingAllEvents = true;
        }
        //if we do find events from that host at different parks on the same day
        //then we need to make sure there are no time conflicts with the park that
        //we are currently trying to book with.
        else {
          //CHECKING TIME CONFLICTS AT ALL THE PARKS THIS USER IS HOSTINGS EVENTS.
          let responseFromCheckingForTimeConflictsAtDifferentParks = validateBookings(
            filteredEventsAllParks,
            startDate,
            duration,
            eventInformation
          );
          if (responseFromCheckingForTimeConflictsAtDifferentParks) {
            validBookingAllEvents = false;
            return res.status(409).json({
              status: 409,
              message:
                "Time conflict. Seems like you have other bookings during these hours at a different park.",
              timeConflictPark: responseFromCheckingForTimeConflictsAtDifferentParks,
            });
          }
          validBookingAllEvents = true;
        }
        //second validation for events at the SAME park.
        if (!filteredEvents) {
          validBooking = true;
        }
        //filtered events holds at least one park, by the same user, on the same day.
        else {
          let responseFromCheckingForTimeConflictsAtSamePark = validateBookings(
            filteredEvents,
            startDate,
            duration,
            eventInformation
          );
          if (responseFromCheckingForTimeConflictsAtSamePark) {
            validBooking = false;
            return res.status(409).json({
              status: 409,
              message:
                "There is a time conflict. You have already booked at this park during this time range.",
              timeConflictPark: responseFromCheckingForTimeConflictsAtSamePark,
            });
          }
          validBooking = true;
        }
      }
    }
    //HERE WILL BE THE FINAL TEST.
    if (validBooking && validBookingAllEvents) {
      eventInformation.hostId = findhost._id;
      let createEvent = await createNewEvent(eventInformation);
      let eventId = createEvent.ops[0]._id;
      if (!eventId) {
        throw new NotFoundError(
          "No event Id from createEvent variable in handleHost."
        );
      }
      //get the event info.
      //then we need to make the host a participant as well
      //also since this will only happen once, will add also the host information as a participant.
      //push the details of the participant a document.
      hostingInformation.parkId = eventInformation.parkId;
      let addParticipant = await addAsParticipant(hostingInformation);
      //then assign the event with that participants Id object
      let participantId = addParticipant.ops[0]._id;
      if (!participantId) {
        throw new NotFoundError(
          "No participant Id from participantId variable in handleHost."
        );
      }
      await updateParticipantId(eventId, participantId);
      //also you need to add the event you joined into the userEvent collection.
      //also need to reupdate the room.
      //also if a there is a new reservation by the host, a room document needs to be recreated.
      await createRoom(eventId, participantId);
      await addUserEvent(hostingInformation.userId, eventId);
      return res.status(200).json({
        status: 200,
        message:
          "Reservation successful. Thanks for booking! Keep in mind you have other events under your name. Also you've been added as a participant",
        hostingInformation: hostingInformation,
      });
    }
    //if you do, success.
  } catch (err) {
    next(err);
  }
};

//@endpoint GET/getParksWithHosts
//@desc get all hosts for a park in Map components.
//@access PRIVATE - will need to validate token? YES

// ------------------- HOSTING ---------------------

const handleGetHosts = async (req, res, next) => {
  try {
    //insert the hosting info into DB
    let allHosts = await getAllHosts();
    if (!allHosts) {
      throw new NotFoundError("Unable to get all hosts in handleGetHosts.");
    }
    return res.status(200).json({
      status: 200,
      message: "Success getting all hosts!",
      hosts: allHosts,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleHosting,
  handleGetHosts,
};
