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

const { getHost } = require("../../services/hostService");

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
    // await db
    //   .collection(collectionHosts)
    //   .findOne({ userId: hostingInformation.userId });
    let validBooking = false;
    let validBookingAllEvents = false;

    //if you dont find a host.
    //will only run once... see if you can refactor this..
    if (!findhost) {
      //make a new host because there are no event related to this host.
      //insert the hosting info into DB
      await db
        .collection(collectionHosts)
        .insertOne(hostingInformation)
        //then get back the _id of the host and insert into the event.
        .then(async (data) => {
          //give the event key the refernece to the hostId.
          //data.ops[0]._id is the hosts object ID.
          try {
            eventInformation.hostId = data.ops[0]._id;
            let eventInfo = await db
              .collection(collectionEvents)
              .insertOne(eventInformation);
            //insert as participant.
            let eventId = eventInfo.ops[0]._id;
            //then we need to make the host a participant as well.
            //also since this will only happen once, will add also the host information as a participant.
            //push the details of the participant a document.
            hostingInformation.parkId = eventInformation.parkId;
            let r = await db
              .collection(collectionParticipants)
              .insertOne({ participants: [hostingInformation] });
            assert(1, r.insertedCount);
            //then assign the event with that participants Id object
            let participantId = r.ops[0]._id;
            let r2 = await db
              .collection(collectionEvents)
              .updateOne(
                { _id: ObjectId(eventId) },
                { $set: { participantId: participantId } }
              );
            assert(1, r2.modifiedCount);
            assert(1, r2.matchedCount);

            let r3 = await db.collection(collectionRooms).insertOne({
              _id: `${eventId}-Room-1`,
              participantId: participantId,
              chatParticipants: [],
            });
            assert(1, r3.insertedCount);

            let addUserEvent = await db
              .collection(collectionUserEvents)
              .updateOne(
                { _id: ObjectId(hostingInformation.userId) },
                { $push: { events: eventId } }
              );
            assert(1, addUserEvent.matchedCount);
            assert(1, addUserEvent.modifiedCount);

            res.status(200).json({
              status: 200,
              message:
                "New Host Reservation successful. Thanks for booking! Also you were added as a participant",
              hostingInformation: hostingInformation,
            });
          } catch (err) {
            console.log(
              err,
              "error occured inside handlehsoting catch in the .then async"
            );
          }
        });
    }
    //if a matching host is found in the Hosts collection.
    else {
      //if a host exists, you can get all events related to that host.
      //find all events related to the host.
      //allEvents will get ALL THE EVENTS of that user... or host on the day he is trying to host.
      let allEvents = await db
        .collection(collectionEvents)
        .find({
          userId: hostingInformation.userId,
          bookedDate: eventInformation.bookedDate,
        })
        .toArray();
      if (!allEvents) {
        //if you don't have anything, then there are no issues booking.
        validBooking = true;
        validBookingAllEvents = true;
      }
      //if there are events under this host
      else {
        //allEvents only has the events related to the current host...
        //filter the events that are held at the CURRENT park at which the host is trying to book.
        let filteredEvents = allEvents.filter((event) => {
          if (event.parkId === eventInformation.parkId) {
            return event;
          }
        });
        //filter and get back all the events related to that host at ANY park.
        //EXCLUDING the current park.
        //this is so we can seperate the messages we want to send back to the front end.
        //if its an error due to the same park or due to another park.
        let filteredEventsAllParks = allEvents.filter((event) => {
          if (event.parkId !== eventInformation.parkId) {
            return event;
          }
        });
        //if current host has not booked any events at any other park...
        //if this passes then first bool text passes so there arnt any time conflicts from any other events at any park.
        if (filteredEventsAllParks.length === 0) {
          console.log("inside 1 bool");
          validBookingAllEvents = true;
        }
        //if we do find events from that host at different parks on the same day
        //then we need to make sure there are no time conflicts with the park that
        //we are currently trying to book with.
        else {
          //---------------------TIME ----------------------------
          let d = new Date();
          //get the currentMinutes - live time.
          let currentMinutes = d.getHours() * 60 + d.getMinutes();
          // get the time in minutes that the person tried booked.
          let startMinutes =
            new Date(startDate).getHours() * 60 +
            new Date(startDate).getMinutes();
          // convert the duration to minutes.
          let durationMinutes = parseInt(duration) * 60;
          // get the end minutes (duration + the start.)
          let endMinutes = startMinutes + durationMinutes;
          //NOW we need to check if any of the other park times are WITHIN these times.
          //this will be a range ...
          //if so ... then there is a conflict.

          //CHECKING TIME CONFLICTS AT ALL THE PARKS THIS USER IS HOSTINGS EVENTS.
          filteredEventsAllParks.forEach((event) => {
            //for each event, grab the start time.
            //NOW we get the range for the starting and ending time of each of the events.
            //now we will check...
            //if the start time of the event is within the range of the current event time,
            //or if the end time is within that range...
            //then there is a conflict.
            //we will check for each of the events.
            let eventStartTime =
              new Date(event.time).getHours() * 60 +
              new Date(event.time).getMinutes();
            let eventEndTime = event.duration * 60 + eventStartTime;
            //see if the start time is within the start-end time for the current booking.
            //checking if start minutes is within the event range and if the end minutes is within the range.
            //if one of them are true... then there is a time conflict.
            if (
              (startMinutes <= eventEndTime &&
                startMinutes >= eventStartTime) ||
              (endMinutes <= eventEndTime && endMinutes >= eventStartTime)
            ) {
              // timeConflict = true;
              validBookingAllEvents = false;
              res.status(409).json({
                status: 409,
                message:
                  "Time conflict. Seems like you have other bookings during these hours at a different park.",
                timeConflictPark: event,
              });
              return;
            }
            //if there wasnt any time conflicts, set bool of first test to true.
            else {
              validBookingAllEvents = true;
              return;
            }
          });
        }

        //second validation for events at the SAME park.
        if (filteredEvents.length === 0) {
          console.log("inside 1 bool");
          validBooking = true;
        }
        //filtered events holds at least one park, by the same user, on the same day.
        else {
          //---------------------TIME ----------------------------
          let d = new Date();
          //get the currentMinutes - live time.
          let currentMinutes = d.getHours() * 60 + d.getMinutes();
          // get the time in minutes that the person tried booked.
          let startMinutes =
            new Date(startDate).getHours() * 60 +
            new Date(startDate).getMinutes();
          // convert the duration to minutes.
          let durationMinutes = parseInt(duration) * 60;
          // get the end minutes
          let endMinutes = startMinutes + durationMinutes;
          //

          //now check for the time.
          //CHECKING TIME CONFLICTS AT THE SPECIFIC PARK HE IS TRYING TO HOST.
          // let timeConflict = false;
          filteredEvents.forEach((event) => {
            //for each event, grab the start time.
            let eventStartTime =
              new Date(event.time).getHours() * 60 +
              new Date(event.time).getMinutes();
            let eventEndTime = event.duration * 60 + eventStartTime;
            //see if the start time is within the start-end time for the current booking.
            if (
              (startMinutes <= eventEndTime &&
                startMinutes >= eventStartTime) ||
              (endMinutes <= eventEndTime && endMinutes >= eventStartTime)
            ) {
              //also check if its the same day. becuase it it isnt
              if (event.bookedDate === eventInformation.bookedDate) {
                // timeConflict = true;
                validBooking = false;
                res.status(409).json({
                  status: 409,
                  message:
                    "There is a time conflict. You have already booked at this park during this time range.",
                  timeConflictPark: event,
                });
                return;
              } else {
                //if there are no time conflicts
                validBooking = true;
                return;
              }
            } else {
              validBooking = true;
              return;
            }
          });
          //everything passes so the booking can go through.
        }
      }
    }
    //HERE WILL BE THE FINAL TEST.
    if (validBooking && validBookingAllEvents) {
      eventInformation.hostId = findhost._id;
      //meaning an event was successfully created.
      let eventInfo = await db
        .collection(collectionEvents)
        .insertOne(eventInformation);
      //grab the id of that event.
      let eventId = eventInfo.ops[0]._id;
      //get the event info.

      //then we need to make the host a participant as well
      //also since this will only happen once, will add also the host information as a participant.
      //push the details of the participant a document.
      hostingInformation.parkId = eventInformation.parkId;
      let r = await db
        .collection(collectionParticipants)
        .insertOne({ participants: [hostingInformation] });
      assert(1, r.insertedCount);
      //then assign the event with that participants Id object
      let participantId = r.ops[0]._id;
      let r2 = await db
        .collection(collectionEvents)
        .updateOne(
          { _id: ObjectId(eventId) },
          { $set: { participantId: participantId } }
        );
      assert(1, r2.modifiedCount);
      assert(1, r2.matchedCount);
      //also you need to add the event you joined into the userEvent collection.

      //also need to reupdate the room.
      //also if a there is a new reservation by the host, a room document needs to be recreated.

      let r3 = await db.collection(collectionRooms).insertOne({
        _id: `${eventId}-Room-1`,
        participantId: participantId,
        chatParticipants: [],
      });
      assert(1, r3.insertedCount);
      //also a host should be registered in his own events.
      //inside the collectionUserEvents.
      let addUserEvent = await db
        .collection(collectionUserEvents)
        .updateOne(
          { _id: ObjectId(hostingInformation.userId) },
          { $push: { events: eventId } }
        );
      assert(1, addUserEvent.matchedCount);
      assert(1, addUserEvent.modifiedCount);
      res.status(200).json({
        status: 200,
        message:
          "Reservation successful. Thanks for booking! Keep in mind you have other events under your name. Also you've been added as a participant",
        hostingInformation: hostingInformation,
      });
    } else {
      res.status(400).json({
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
//@desc get all hosts for a park
//@access PRIVATE - will need to validate token? YES

// ------------------- HOSTING ---------------------

const handleGetHosts = async (req, res, next) => {
  console.log("inside get hosts.");

  try {
    const db = getConnection().db(dbName);
    //insert the hosting info into DB
    await db
      .collection(collectionHosts)
      .find()
      .toArray()
      .then((data) => {
        console.log(data);
        res.status(200).json({
          status: 200,
          message: "Success getting all hosts!",
          hosts: data,
        });
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
