const {
  getEventById,
  getParticipantsById,
} = require("../../services/joinLeaveCancelService");

const { UnauthorizedError, NotFoundError } = require("../../utils/errors");
//@endpoint GET /getChatRoom
//@desc get chat room ID for specified EVENT.
//@access PRIVATE - will need to validate token? YES - add...
const handleGetChatRoom = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    if (!eventId) {
      let err = new UnauthorizedError("Missing event Id for chat room.");
      next(err);
    }
    // const db = getConnection().db(dbName);
    let eventData = await getEventById(eventId);
    if (!eventData) {
      let err = new NotFoundError(
        "Unable to retrieve event data for handleGetChatRoom."
      );
      next(err);
    }
    let participantData = await getParticipantsById(eventData.participantId);
    if (!participantData) {
      let err = new NotFoundError("There are no participants for this event.");
      next(err);
    }
    res.status(200).json({
      status: 200,
      message:
        "Success getting participantID events associated with the event.",
      participantId: eventData.participantId,
      eventParticipants: participantData.participants,
    });
  } catch (error) {
    console.log(error.stack, "Catch Error in handleGetChatRoom ");
    res.status(500).json({ status: 500, message: error.message });
  }
};
module.exports = {
  handleGetChatRoom,
};
