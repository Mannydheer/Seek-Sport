const { Logger } = require("../config/logger");
const logger = Logger.getInstance();

const {
  //handleJoinEvent.
  getEventById,
  getParticipantsById,
  getMatchingParticipant,
  addParticipant,
  addUserEvent,
  removeParticipant,
  removeUserEvent,
  deleteRoom,
  deleteParticipants,
  deleteEvent,
  //handleLeaveEvent.

  //handleCancelEvent.
} = require("../services/joinLeaveCancelService");

const {
  NotFoundError,
  ConflictError,
  BadRequestError,
} = require("../utils/errors");

//@endpoint POST /joinEvent
//@desc join the event selected from ViewActivity component.
//@access PRIVATE - will need to validate token? YES
const handleJoinEvent = async (req, res, next) => {
  try {
    const participantDetails = req.body.participantDetails;
    const eventInformation = req.body.eventInformation;
    //ensure we recieved the information.
    if (
      !eventInformation._id ||
      !eventInformation.participantId ||
      !participantDetails.userId ||
      !participantDetails.eventId
    ) {
      throw new BadRequestError(
        "Missing information from event or participant in handleJoinEvent."
      );
    }
    let getEvent = await getEventById(eventInformation._id);
    //ensure getEvent is not missing participantsId.
    //see if there is a participant ID in that event. If so then there are at least 1 participant.
    //if there is a participant ID.
    //check if that participant doesnt already exist... in that event.
    if (!getEvent.participantId) {
      throw new NotFoundError(
        "Missing event participant Id in handleJoinEvent."
      );
    }
    let getParticipants = await getParticipantsById(getEvent.participantId);
    if (!getParticipants) {
      throw new NotFoundError(
        "Failed getting participants in handleJoinEvent."
      );
    }
    //if you get participants. Which you will 100% because if you have a apeticipant ID then there are participants
    //check if any of the participants in the array match the current participant trying to join.
    let existingParticipant = getMatchingParticipant(
      getParticipants,
      participantDetails.userId
    );
    //if they do match...
    if (existingParticipant) {
      throw new ConflictError("existing participant in handleJoinevent.");
    }
    //if you don't find a matching participant.
    //add the incoming participant to that.
    let updateParticipant = await addParticipant(
      eventInformation.participantId,
      participantDetails
    );
    //when signing up, you create a _id = to the userId in the collectionUserEvents.
    //now we will push the event id in the array in this event to keep track of which events the user JOINED!
    let updateUserEvent = await addUserEvent(
      participantDetails.userId,
      participantDetails.eventId
    );
    if (!updateParticipant || !updateUserEvent) {
      throw new NotFoundError(
        "Error occured. Unable to update participants and user events in handleJoinEvent function."
      );
    }
    return res
      .status(200)
      .json({ status: 200, message: "Successfully joined the event!" });
  } catch (err) {
    next(err);
  }
};
//@endpoint POST /leaveEvent
//@desc leave the event selected from ViewActivity comp.
//@access PRIVATE - will need to validate token? YES
const handleLeaveEvent = async (req, res, next) => {
  const participantDetails = req.body.participantDetails;
  const eventInformation = req.body.eventInformation;
  try {
    if (
      //checking if any of these variables are empty.
      !participantDetails.userId ||
      !eventInformation._id ||
      !eventInformation.participantId
    ) {
      throw new BadRequestError(
        "Missing information from event or participant in handleLeaveEvent."
      );
    }
    //now you have the participant ID from eventInformation.
    //find the participant collect from the event ParticipantId key.
    //now within that, remove the participant
    let updateParticipant = await removeParticipant(
      eventInformation.participantId,
      participantDetails.userId
    );
    let updateUserEvent = await removeUserEvent(
      participantDetails.userId,
      eventInformation._id
    );
    if (!updateParticipant || !updateUserEvent) {
      throw new NotFoundError(
        "Error occured. Unable to remove participants and user events in handleLeaveEvent function."
      );
    }
    return res
      .status(200)
      .json({ status: 200, message: "Successfully left the event!" });
  } catch (err) {
    next(err);
  }
};

//@endpoint POST /cancelEvent
//@desc cancel the event selected
//@access PRIVATE - will need to validate token? YES
const handleCancelEvent = async (req, res, next) => {
  try {
    const eventId = req.body.eventId;
    if (!eventId) {
      throw new BadRequestError("Missing information from event");
    }
    let getEvent = await getEventById(eventId); //get the event for participantId.
    if (!getEvent) {
      throw new NotFoundError("Unable to get event in handleCancelEvent.");
    }
    let deletedRoom = await deleteRoom(eventId); //for chat system.
    let deletedEvent = await deleteEvent(eventId); //delete event.
    if (!deletedEvent || !deletedRoom) {
      throw new NotFoundError(
        "Unable to delete room or event in handleCancelEvent."
      );
    }
    let getParticipants = await getParticipantsById(getEvent.participantId);
    if (!getParticipants) {
      throw new NotFoundError(
        "Unable to get participants in handleCancelEvent"
      );
    }
    let removeUserAsParticipant = await getParticipants.participants.forEach(
      async (participant) => {
        await removeUserEvent(participant.userId, eventId);
      }
    );
    let deletedParticipants = await deleteParticipants(getEvent.participantId);

    if (!deletedParticipants) {
      throw new ConflictError("Unable to delete participants for the event");
    }
    logger.info(`Deleted participant: ${getEvent.participantId}`);
    return res
      .status(200)
      .json({ status: 200, message: "Successfully canceled the event!" });
  } catch (err) {
    next(err);
  }
  //also must remove all users that were registered for this event.
  //since we have the eventId... we can get the participantId and find the participants from the participant collection.
  //now for each user, we need to find the event being canceled in their array and delete it.
  //now we need to find all users from the collectionUserEvents and delete the event.
};

module.exports = { handleJoinEvent, handleLeaveEvent, handleCancelEvent };
