const {
  getEventById,
  getParticipantsById,
} = require("../../services/joinLeaveCancelService");

const { NotFoundError, BadRequestError } = require("../../utils/errors");
//@endpoint GET /getChatRoom
//@desc get chat room ID for specified EVENT.
//@access PRIVATE - will need to validate token? YES - add...
const handleGetChatRoom = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    if (!eventId) {
      throw new BadRequestError("Missing event Id for chat room.");
    }
    // const db = getConnection().db(dbName);
    let eventData = await getEventById(eventId);
    if (!eventData) {
      throw new NotFoundError(
        "Unable to retrieve event data for handleGetChatRoom."
      );
    }
    let participantData = await getParticipantsById(eventData.participantId);
    if (!participantData) {
      throw new NotFoundError("There are no participants for this event.");
    }
    res.status(200).json({
      status: 200,
      message:
        "Success getting participantID events associated with the event.",
      participantId: eventData.participantId,
      eventParticipants: participantData.participants,
    });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  handleGetChatRoom,
};
