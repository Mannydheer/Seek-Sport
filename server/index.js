'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
//multer
const multer = require('multer')

//mongo
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://dbUser:YOFwbi6x3P5o3H4d@cluster0-seh3x.mongodb.net/test?authSource=admin&replicaSet=Cluster0-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true"

const dbName = 'ParkGames';
const collectionUsers = 'Users'
const collectionHosts = 'Hosts'
const collectionEvents = 'Events'
const collectionParticipants = 'Participants'
const collectionUserEvents = 'UserEvents'
const collectionRooms = 'Rooms'
const collectionChats = "Chats"

const assert = require('assert')
var ObjectId = require('mongodb').ObjectID;


//built in node module
const http = require('http');
const socketio = require('socket.io');

const users = [];
// const upload = multer({ dest: 'uploads/' })

const { handleSignUp, handleLogin,
    handleGetUser, handleNearbySearch,
    handlePhoto,
    handleHosting,
    handleGetHosts,
    handleGetEvents,
    handleUserEvents,
    handleJoinEvent,
    handleViewActivityEvents,
    handleLeaveEvent,
    handleCurrentEventParticipants,
    handleCancelEvent,
    handleSelectedParkEvents,
    handleUserActivities,
    handleUserRegisteredEvents,
    handleGetChatRoom,

} = require('./handlers')

const { addUserChat, getUserChat, getUsersInRoom, addUser } = require('./chatHandlers');

const { auth } = require('../server/middleware')
require('dotenv').config();
//data file for items
const upload = multer({ dest: './public/uploads/' })
const PORT = 4000;
var app = express()

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
    if (err) throw { Error: err, message: "error occured connected to DB" }
    console.log("Connected to DB in addUserChat")
    //db
    const db = client.db(dbName)



    io.on('connection', (socket) => {
        console.log('we have a new connections!!!')
        console.log(socket.id, 'SOCKETID')
        socket.on('join', async ({ name, userId, room }, callback) => {
            console.log('inside join socket.')
            let chatMemberDetails = {
                socketId: socket.id,
                userId: userId,
                roomId: room,
                name: name
            }
            //before inserting someone in room...
            //check that he is not already there.
            let getRoom = await db.collection(collectionRooms).findOne({ _id: room })
            //if no participants
            //then we can create one... move to the else.

            if (getRoom.chatParticipants.length > 0) {

                let existingUser = getRoom.chatParticipants.find(user => {
                    if (user.userId === userId) {
                        return user
                    }
                })

                //if there are participants, check if there is the person trying to join isn't 
                //already joined.
                if (existingUser) {

                    let getRoom = await db.collection(collectionRooms).findOne({ _id: room })
                    //then send back the room message hisotry.
                    // socket.emit('room-message-history', getRoom)
                    // console.log('Existing User')
                    let messageInfo = {
                        existingUser: true,
                        roomData: getRoom,
                        room: room,
                        updateChatParticipants: getRoom.chatParticipants
                    }
                    callback(messageInfo)
                }
                //If he is not an existing user...
                //allow to join.
                else if (!existingUser) {

                    await db.collection(collectionRooms).updateOne({ _id: room }, { $push: { chatParticipants: chatMemberDetails } })
                    //if hes not already in the room...
                    //we need to send back the data regarding that room. 
                    let getRoom = await db.collection(collectionRooms).findOne({ _id: room })
                    //then join the room with sockket.
                    //room is the eventId-First-Room.
                    socket.join(room)
                    // socket.emit('room-message-history', getRoom)
                    // io.to(room).emit('chat-message', 'JOINED') //useless - change.
                    let messageInfo = {
                        joined: true,
                        message: `${name} has joined ${room}.`,
                        updateChatParticipants: getRoom.chatParticipants,
                        room: room,
                        roomData: getRoom,

                    }
                    callback(messageInfo)

                    //to show which other users have joined or left.
                    socket.broadcast.emit('users-join-leave', messageInfo)
                    // callback(messageInfo.message)

                }
            }
            //we will now add the person to the room.
            else {
                await db.collection(collectionRooms).updateOne({ _id: room }, { $push: { chatParticipants: chatMemberDetails } })
                let getRoom = await db.collection(collectionRooms).findOne({ _id: room })
                //room is the eventId-First-Room.
                //user will join room.
                socket.join(room)

                //send back room message history.
                // socket.emit('room-message-history', getRoom)
                let messageInfo = {
                    joined: true,
                    message: `${name} has joined ${room}.`,
                    updateChatParticipants: getRoom.chatParticipants,
                    room: room,
                    roomData: getRoom,

                }
                callback(messageInfo)
                //send back the join and leaver.
                socket.broadcast.emit('users-join-leave', messageInfo)

            }
        })

        socket.on('sendMessage', async (data, callback) => {
            //now that we have the message...
            //get particular room 
            console.log(data)
            let getRoom = await db.collection(collectionRooms).findOne({ _id: data.room });
            await db.collection(collectionRooms).updateOne({ _id: data.room }, { $push: { messages: data } })
            // io.in(data.room).emit('chat-message', data)
            socket.broadcast.emit('chat-message', data)
        })

        socket.on('leaveRoom', async (data, callback) => {
            socket.leave(data.room)
            console.log('left room')
            //now that we have the message...
            let updateChatMember = await db.collection(collectionRooms).updateOne({ _id: data.room }, { $pull: { chatParticipants: { userId: data.userId } } })
            assert(1, updateChatMember.matchedCount)
            assert(1, updateChatMember.modifiedCount)
            let findChatMembers = await db.collection(collectionRooms).findOne({ _id: data.room })


            let messageInfo = {
                message: `${data.name} has left the room. Reload to join`,
                updateChatParticipants: findChatMembers.chatParticipants,
                room: data.room
            }
            callback(messageInfo)
            socket.broadcast.emit('users-join-leave', messageInfo)
        })

    })
})













//const server
app.use(function (req, res, next) {
    res.header(
        'Access-Control-Allow-Methods',
        'OPTIONS, HEAD, GET, PUT, POST, DELETE'
    );
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
})
app.use(morgan('tiny'))
app.use(express.static('./server/assets'))
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))
app.use('/', express.static(__dirname + '/'))
// app.use('/uploads', express.static('/uploads'))



//endpoints.
// app.post('/fileUpload', , handleFile)
//signup
app.post('/SignUp', upload.single('file'), handleSignUp)
//login
app.post('/Login', handleLogin)
//get user
app.get('/user/profile', auth, handleGetUser)
//nearby search parks
app.post('/nearbySearch', handleNearbySearch)
//
app.post('/parkPhoto', handlePhoto)
//store the hosting informaiton
app.post('/hostingInformation', auth, handleHosting)
app.get('/getParksWithHosts', handleGetHosts)
//store event information
app.get('/getEvents', handleGetEvents)
//user events.
app.get('/userEvents/:_id', auth, handleUserEvents)
//join event.
app.post('/joinEvent', auth, handleJoinEvent)
//leave event.
app.post('/leaveEvent', auth, handleLeaveEvent)
//cancel event.
app.post('/cancelEvent', auth, handleCancelEvent)

//viewActivityEvents 
app.post('/viewActivityEvents', auth, handleViewActivityEvents)
//selectedPark
app.get('/currentEventParticipants/:participantId', auth, handleCurrentEventParticipants)
//
app.get('/selectedParkEvents/:parkId', auth, handleSelectedParkEvents)
//user activities.
app.get('/userActivities/:userId', auth, handleUserActivities)
//gets all registered events for a user.
//inside Chat component.
app.get('/userRegisteredEvents/:_id', handleUserRegisteredEvents)
//gets the room associated with a particular event.
//inside ChatJoin component.
app.get('/getChatRoom/:eventId', handleGetChatRoom)





//CHAT
// app.get('/chat', handleChat)


server.listen(PORT, () => console.info(`Listening on port ${PORT}`));

