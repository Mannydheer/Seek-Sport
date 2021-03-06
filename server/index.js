"use strict";
require("dotenv").config();
const { Logger } = require("./config/logger");
//getInstance will return the logger.
let logger = Logger.getInstance();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
//multer
const multer = require("multer");
//logger.
//mongo
const MongoClient = require("mongodb").MongoClient;
const uri =
  "mongodb+srv://dbUser:YOFwbi6x3P5o3H4d@cluster0-seh3x.mongodb.net/test?authSource=admin&replicaSet=Cluster0-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true";
const collectionRooms = "Rooms";
const assert = require("assert");
//built in node module
const http = require("http");
const socketio = require("socket.io");
//errors.
const { HttpException } = require("./utils/errors");
//chat controller.
const { handleGetChatRoom } = require("./controllers/handlers/chatController");
//user events controller.
//host controller
const {
  handleUserRegisteredEvents,
  handleUserActivities,
} = require("./controllers/UserEventsActivitiesController");
const {
  handleHosting,
  handleGetHosts,
} = require("./controllers/handlers/hostController");
//event controller.
const {
  handleGetEvents,
  handleUserEvents,
  handleCurrentEventParticipants,
  handleSelectedParkEvents,
} = require("./controllers/handlers/eventController");
//user login-signup controller.
const {
  handleGetUser,
  handleLogin,
  handleSignUp,
} = require("./controllers/authController");
//google-api controller
const {
  handlePhoto,
  handleNearbySearch,
} = require("./gateways/google-api-requests");
//join-cancel-leave event controller.
const {
  handleJoinEvent,
  handleLeaveEvent,
  handleCancelEvent,
} = require("./controllers/joinLeaveCancelController");
//authorize middleware. (token checking)
const { auth } = require("./controllers/middleware-controller");
//CONNECTION TO MONGO DB.
const { handleConnection, getConnection } = require("./connection/connection");

//data file for items
const upload = multer({ dest: "./public/uploads/" });
const PORT = 4000;
const dbName = "ParkGames";
// LOGGER.
var app = express();
//set up socket io.
const server = http.createServer(app);
//socket io server.
const io = socketio(server);
//this wil run when we have a client connection on our ion instance.
//this will be used to keep track of clients joining and leaving. (connect and disconnect0)
//connect to db
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect(async (err) => {
  if (err) throw { Error: err, message: "error occured connected to DB" };
  console.log("Connected to DB in addUserChat");
  const db = client.db(dbName);
  io.on("connection", (socket) => {
    console.log("we have a new connections!!!");
    socket.on("join", async ({ name, userId, room }, callback) => {
      console.log("inside join socket.");
      let chatMemberDetails = {
        socketId: socket.id,
        userId: userId,
        roomId: room,
        name: name,
      };
      //before inserting someone in room...
      //check that he is not already there.
      let getRoom = await db.collection(collectionRooms).findOne({ _id: room });
      //if no participants
      //then we can create one... move to the else.
      //ORDER MATTERS OF THE IF.
      if (getRoom && getRoom.chatParticipants.length > 0) {
        let existingUser = getRoom.chatParticipants.find((user) => {
          if (user.userId === userId) {
            return user;
          }
        });
        //if there are participants, check if there is the person trying to join isn't
        //already joined.
        if (existingUser) {
          let messageInfo = {
            existingUser: true,
            roomData: getRoom,
            room: room,
            updateChatParticipants: getRoom.chatParticipants,
          };
          callback(messageInfo);
        }
        //If he is not an existing user...
        //allow to join.
        else if (!existingUser) {
          await db
            .collection(collectionRooms)
            .updateOne(
              { _id: room },
              { $push: { chatParticipants: chatMemberDetails } }
            );
          //if hes not already in the room...
          //we need to send back the data regarding that room.
          let getRoom = await db
            .collection(collectionRooms)
            .findOne({ _id: room });
          //then join the room with sockket.
          //room is the eventId-First-Room.
          socket.join(room);
          // socket.emit('room-message-history', getRoom)
          // io.to(room).emit('chat-message', 'JOINED') //useless - change.
          let messageInfo = {
            joined: true,
            message: `${name} has joined ${room}.`,
            updateChatParticipants: getRoom.chatParticipants,
            room: room,
            roomData: getRoom,
          };
          callback(messageInfo);
          //to show which other users have joined or left.
          socket.broadcast.emit("users-join-leave", messageInfo);
          // callback(messageInfo.message)
        }
      }
      //we will now add the person to the room.
      else {
        console.log("HERE IS THE ERROR");
        await db
          .collection(collectionRooms)
          .updateOne(
            { _id: room },
            { $push: { chatParticipants: chatMemberDetails } }
          );
        let getRoom = await db
          .collection(collectionRooms)
          .findOne({ _id: room });
        //room is the eventId-First-Room.
        //user will join room.
        socket.join(room);
        //send back room message history.
        // socket.emit('room-message-history', getRoom)
        let messageInfo = {
          joined: true,
          message: `${name} has joined ${room}.`,
          updateChatParticipants: getRoom.chatParticipants,
          room: room,
          roomData: getRoom,
        };
        callback(messageInfo);
        //send back the join and leaver.
        socket.broadcast.emit("users-join-leave", messageInfo);
      }
    });
    socket.on("sendMessage", async (data, callback) => {
      //now that we have the message...
      //get particular room
      console.log(data);
      let getRoom = await db
        .collection(collectionRooms)
        .findOne({ _id: data.room });
      await db
        .collection(collectionRooms)
        .updateOne({ _id: data.room }, { $push: { messages: data } });
      // io.in(data.room).emit('chat-message', data)
      socket.broadcast.emit("chat-message", data);
    });
    socket.on("leaveRoom", async (data, callback) => {
      socket.leave(data.room);
      console.log("left room");
      //now that we have the message...
      let updateChatMember = await db
        .collection(collectionRooms)
        .updateOne(
          { _id: data.room },
          { $pull: { chatParticipants: { userId: data.userId } } }
        );
      assert(1, updateChatMember.matchedCount);
      assert(1, updateChatMember.modifiedCount);
      let findChatMembers = await db
        .collection(collectionRooms)
        .findOne({ _id: data.room });
      let messageInfo = {
        message: `${data.name} has left the room. Reload to join`,
        updateChatParticipants: findChatMembers.chatParticipants,
        room: data.room,
      };
      callback(messageInfo);
      socket.broadcast.emit("users-join-leave", messageInfo);
    });
  });
});
//const server
app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Methods",
    "OPTIONS, HEAD, GET, PUT, POST, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(morgan("tiny"));
app.use(express.static("./server/assets"));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", express.static(__dirname + "/"));
// --------------------ENDPOINTS-------------------
//signup
app.post("/SignUp", upload.single("file"), handleSignUp);
//login
app.post("/Login", handleLogin);
//get user
app.get("/user/profile", auth, handleGetUser);
//nearby search parks
app.post("/nearbySearch", handleNearbySearch);
app.post("/parkPhoto", handlePhoto);
//store the hosting informaiton
app.post("/hostingInformation", auth, handleHosting);
app.get("/getParksWithHosts", handleGetHosts);
//store event information
app.get("/getEvents", handleGetEvents);
//user events.
app.get("/userEvents/:_id", auth, handleUserEvents);
//join event.
app.post("/joinEvent", auth, handleJoinEvent);
//leave event.
app.post("/leaveEvent", auth, handleLeaveEvent);
//cancel event.
app.post("/cancelEvent", auth, handleCancelEvent);
//selectedPark
app.get(
  "/currentEventParticipants/:participantId",
  auth,
  handleCurrentEventParticipants
);
//*******************************************************************/
app.get("/selectedParkEvents/:parkId", auth, handleSelectedParkEvents);
//user activities.
app.get("/userActivities/:userId", auth, handleUserActivities);
//gets all registered events for a user.
//inside Chat component.
app.get("/userRegisteredEvents/:_id", handleUserRegisteredEvents);
//gets the room associated with a particular event.
//inside ChatJoin component.
app.get("/getChatRoom/:eventId", handleGetChatRoom);
// ------------------------------CUSTOM ERROR ----------------------------
app.use(function (err, req, res, next) {
  //check if the err is instance of any of our custom errors.
  if (err instanceof HttpException) {
    logger.error(`File: ${err.stack} || Code: ${err.code} `);
    return res
      .status(err.code)
      .json({ message: err.message, stack: err.stack });
  }
  //if its a 500.
  logger.error(`File: ${err.stack} || Code: ${err.code} `);
  return res
    .status(500)
    .json({ message: "unexpected error occured.", error: JSON.stringify(err) });
});
// ------------------------------CONNECT TO MONGODB ----------------------------
const connection = async () => {
  try {
    let connectionResponse = await handleConnection();

    if (connectionResponse) {
      server.listen(PORT, () => logger.info(`Listening on port ${PORT}`));
    }
  } catch (err) {
    console.log(err);
  }
};
connection();
