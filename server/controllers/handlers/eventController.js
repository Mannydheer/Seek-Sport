const {
  getAllEvents,
  getEventsAssociatedWithUser,
  allParticipantsArray,
  getParticipantData,
  getEventsAssociatedWithPark,
} = require("../../services/eventService");

const {
  getParticipantsById,
} = require("../../services/joinLeaveCancelService");

const { NotFoundError, BadRequestError } = require("../../utils/errors");

//@endpoint GET /getEvents
//@desc all events on the map.
//@access PUBLIC
const handleGetEvents = async (req, res, next) => {
  try {
    let allEvents = await getAllEvents();
    if (!allEvents) {
      throw new NotFoundError(
        "Unable to retrieve all events in handleGetEvents event controller."
      );
    }
    return res.status(200).json({
      status: 200,
      message: "Success getting all events!",
      events: allEvents,
    });
  } catch (err) {
    next(err);
  }
};

//@endpoint GET /userEvents/:_id
//@desc get events associated with current user logged in.
//@access PRIVATE - will need to validate token? YES
const handleUserEvents = async (req, res, next) => {
  try {
    const _id = req.params._id;
    if (!_id) {
      throw new BadRequestError("Missing id in handleUserEvents");
    }
    let allData = await getEventsAssociatedWithUser(_id);
    if (!allData) {
      throw new NotFoundError(
        "There are no events booked in handleUserEvents."
      );
    }
    //function will push all participantId for each event into an array.
    let participants = allParticipantsArray(allData);
    //this will return all participants for each event. Now there is access to all participants for each event the user is participanting in.
    let participantData = await getParticipantData(participants);
    if (!participantData) {
      throw new NotFoundError(
        "There are no participants for this event in handleUserEvents"
      );
    }
    return res.status(200).json({
      status: 200,
      message:
        "Success getting all events & participants associated with the user!",
      events: allData,
      participants: participantData,
    });
  } catch (err) {
    next(err);
  }
};

//@endpoint POST /currentEventParticipants/:participantId,
//@desc get all events associated with that park.
//@access PRIVATE - will need to validate token? YES
const handleCurrentEventParticipants = async (req, res, next) => {
  try {
    let participantId = req.params.participantId;
    if (!participantId) {
      throw new BadRequestError(
        "Missing participant Id in handleCurrentEventParticipants"
      );
    }
    //insert the hosting info into DB
    let participantData = await getParticipantsById(participantId);
    if (!participantData) {
      throw new NotFoundError(
        "Currently no participants registered for this event in handleCurrentEventParticipants"
      );
    }
    //success.
    return res.status(200).json({
      status: 200,
      message: "Success getting participants for single event.",
      eventParticipants: participantData.participants,
    });
  } catch (err) {
    next(err);
  }
};

//@endpoint GET /selectedParkEvents
//@desc get all events associated with the selected park.
//@access PRIVATE - will need to validate token? YES
//NOTES - CHECK HANDLEGETEVENTS
const handleSelectedParkEvents = async (req, res, next) => {
  //connect to db
  try {
    let parkId = req.params.parkId;
    if (!parkId) {
      throw new BadRequestError("Missing park Id in handleSelectedParkEvents.");
    }
    let allEventsForAssociatedPark = await getEventsAssociatedWithPark(parkId);
    if (!allEventsForAssociatedPark) {
      throw new NotFoundError("No events associated with this park.");
    }
    return res.status(200).json({
      status: 200,
      message: "Success getting all events for selected park!",
      events: allEventsForAssociatedPark,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleGetEvents,
  handleUserEvents,
  handleCurrentEventParticipants,
  handleSelectedParkEvents,
};
