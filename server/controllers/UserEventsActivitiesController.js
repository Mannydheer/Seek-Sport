const {
  getUserFromUserEvents,
  allEventsArray,
  getAllEventsUserRegisteredFor,
  filterEventData,
} = require("../services/UserEventsActivitiesService");

//@endpoint GET /userActivities
//@desc get all events that the user joined
//@access PRIVATE - will need to validate token? YES
const handleUserActivities = async (req, res, next) => {
  try {
    let userId = req.params.userId;
    if (!userId) {
      res.status(400).json({
        status: 400,
        message: "Missing user credentials in handleUserActivities.",
      });
    }
    let userData = await getUserFromUserEvents(userId);
    //if you have never signed up for any events yet.
    if (!userData.events) {
      return res.status(400).json({
        status: 400,
        message:
          "Seems like you are new, you may head to the home page to find activities or talk to our chatbot!",
      });
    }
    //if you registered for events.
    let allEvents = allEventsArray(userData);
    let eventData = await getAllEventsUserRegisteredFor(allEvents, userId);
    if (!eventData) {
      res.status(400).json({
        status: 400,
        message: "Currently not registered for any events.",
      });
    }
    let filteredEventData = filterEventData(eventData);
    if (filteredEventData) {
      return res.status(200).json({
        status: 200,
        message: "Success getting all events you have registered for!",
        events: filteredEventData,
      });
    }
    return res.status(400).json({
      status: 400,
      message:
        "Seems like you have no registered to any events! Head to the home page to find activities!",
    });

    //find all the events that you have registered for.
  } catch (error) {
    console.log(error.stack, "Catch Error in handleSelectedParkEvents");
    res.status(500).json({ status: 500, message: error.message });
  }
};

//@endpoint GET /userRegisteredEvents/:_id
//@desc get registered events associated with current user logged in.
//@access PRIVATE - will need to validate token? YES
const handleUserRegisteredEvents = async (req, res, next) => {
  try {
    const userId = req.params._id;
    if (!userId) {
      res.status(400).json({
        status: 400,
        message: "Missing user credentials in handleUserRegisteredEvents.",
      });
    }
    let userData = await getUserFromUserEvents(userId);
    if (!userData.events) {
      return res.status(404).json({
        status: 404,
        message: "There are no registered events under this user.",
      });
    }
    //now we have array of event Ids... we can get back all ids.
    let allEvents = allEventsArray(userData);
    let eventData = await getAllEventsUserRegisteredFor(allEvents, userId);
    if (!eventData) {
      res.status(400).json({
        status: 400,
        message:
          "Currently not registered for any events in handleUserRegisteredEvents.",
      });
    }
    res.status(200).json({
      status: 200,
      message:
        "Success getting all registered events associated with the user!",
      userRegisteredEvents: allEvents.events,
      eventInfo: eventData,
    });
  } catch (error) {
    console.log(error.stack, "Catch Error in handleUserRegisteredEvents ");
    res.status(500).json({ status: 500, message: error.message });
  }
};

module.exports = { handleUserRegisteredEvents, handleUserActivities };
