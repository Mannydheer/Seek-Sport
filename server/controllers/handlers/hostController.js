"use strict";

const { getConnection } = require("../../connection/connection");

const dbName = "ParkGames";
const collectionHosts = "Hosts";
const collectionEvents = "Events";
const collectionParticipants = "Participants";
const collectionUserEvents = "UserEvents";
const collectionRooms = "Rooms";

const assert = require("assert");
var ObjectId = require("mongodb").ObjectID;

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
      return res.status(400).json({
        status: 400,
        message: "Missing information in order to host.",
      });
    }
    const db = getConnection().db(dbName);
    //first see if the host already exists.
    let findhost = await getHost(hostingInformation.userId);
    let validBooking = false;
    let validBookingAllEvents = false;
    //if you dont find a host.
    //will only run once... see if you can refactor this..
    if (!findhost) {
      console.log("THIS IS FIND HOST");
      //make a new host because there are no event related to this host.
      //insert the hosting info into DB
      let hostInserted = await createNewHost(hostingInformation);
      if (!hostInserted) {
        return res
          .status(400)
          .json({ status: 400, message: "Unable to create a new host." });
      }
      //give the event key the refernece to the hostId.
      //data.ops[0]._id is the hosts object ID.
      eventInformation.hostId = hostInserted.ops[0]._id;
      let createEvent = await createNewEvent(eventInformation);
      if (!createEvent) {
        return res
          .status(400)
          .json({ status: 400, message: "Failed to create new event." });
      }
      //insert as participant.
      let eventId = createEvent.ops[0]._id;
      //then we need to make the host a participant as well.
      //also since this will only happen once, will add also the host information as a participant.
      //push the details of the participant a document.
      hostingInformation.parkId = eventInformation.parkId;
      let addParticipant = await addAsParticipant(hostingInformation);
      if (!addParticipant) {
        return res
          .status(400)
          .json({ status: 400, message: "Failed to add participant." });
      }
      //then assign the event with that participants Id object
      let participantId = addParticipant.ops[0]._id;
      let updateParticipantIdForEvent = await updateParticipantId(
        eventId,
        participantId
      );
      if (!updateParticipantIdForEvent) {
        return res.status(400).json({
          status: 400,
          message: "Failed to update participant Id in the event.",
        });
      }
      let addRoom = await createRoom(eventId, participantId);
      if (!addRoom) {
        return res.status(400).json({
          status: 400,
          message: "Failed to create new chat room.",
        });
      }
      let addEventToUserEvents = await addUserEvent(
        hostingInformation.userId,
        eventId
      );
      if (!addEventToUserEvents) {
        return res.status(400).json({
          status: 400,
          message: "Failed to event as an an event the user is registered for.",
        });
      }
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
      if (!createEvent) {
        return res
          .status(400)
          .json({ status: 400, message: "Failed to create new event." });
      }
      let eventId = createEvent.ops[0]._id;
      //get the event info.
      //then we need to make the host a participant as well
      //also since this will only happen once, will add also the host information as a participant.
      //push the details of the participant a document.
      hostingInformation.parkId = eventInformation.parkId;
      let addParticipant = await addAsParticipant(hostingInformation);
      if (!addParticipant) {
        return res
          .status(400)
          .json({ status: 400, message: "Failed to add participant." });
      }
      //then assign the event with that participants Id object
      let participantId = addParticipant.ops[0]._id;
      let updateParticipantIdForEvent = await updateParticipantId(
        eventId,
        participantId
      );
      if (!updateParticipantIdForEvent) {
        return res.status(400).json({
          status: 400,
          message: "Failed to update participant Id in the event.",
        });
      }
      //also you need to add the event you joined into the userEvent collection.
      //also need to reupdate the room.
      //also if a there is a new reservation by the host, a room document needs to be recreated.
      let addRoom = await createRoom(eventId, participantId);
      if (!addRoom) {
        return res.status(400).json({
          status: 400,
          message: "Failed to create new chat room.",
        });
      }

      let addEventToUserEvents = await addUserEvent(
        hostingInformation.userId,
        eventId
      );
      if (!addEventToUserEvents) {
        return res.status(400).json({
          status: 400,
          message: "Failed to event as an an event the user is registered for.",
        });
      }
      return res.status(200).json({
        status: 200,
        message:
          "Reservation successful. Thanks for booking! Keep in mind you have other events under your name. Also you've been added as a participant",
        hostingInformation: hostingInformation,
      });
    } else {
      return res.status(400).json({
        status: 400,
        message: "Booking was not valid - time conflicts.",
      });
    }
    //if you do, success.
  } catch (error) {
    console.log(error.stack, "Catch Error in handleHosting");
    res.status(500).json({ status: 500, message: error.message });
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
    return res.status(200).json({
      status: 200,
      message: "Success getting all hosts!",
      hosts: allHosts,
    });
  } catch (error) {
    console.log(error.stack, "Catch Error in handleHosting");
    res.status(500).json({ status: 500, message: error.message });
  }
};

module.exports = {
  handleHosting,
  handleGetHosts,
};
