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
    handleGetChatRoom
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


    io.on('connection', (socket) => {
        console.log('we have a new connections!!!')

        socket.on('join', async ({ name, userId, room }, callback) => {

            //room is the participant iD!

            //see if the user is is allowed to join the chat.
            const db = client.db(dbName)
            //find the participants array for that room
            let checkForUser = await db.collection(collectionRooms).findOne({ _id: ObjectId(room) })
            //now check if current user is allowed to join by checking if he is a participant in the event.
            let match = checkForUser.chatParticipants.find(user => {
                if (user.userId === userId) {
                    return user
                }
            })
            console.log(match)
            //if no match...
            if (match) {
                //FIX MESSAGE.
                console.log('already in the room... cannot join')
            }
            //if he not in the room, then he can join.
            else {
                let userChatDetails = {
                    socketId: socket.id,
                    userId: userId,
                    roomId: room,
                    name: name
                }
                let r = await db.collection(collectionChats).insertOne({ userChatDetails })
                assert(1, r.insertedCount)
                //then join the room with sockket.
                socket.join(room)
                io.to(room).emit('chat-message', 'JOINED')
                socket.broadcast.emit('chat-message', `${name} has joined.`)
            }

        })

        //now it is a socket.on, and not a io.on
        socket.on('disconnect', async () => {
            const db = client.db(dbName)
            console.log('USER HAS LEFT')

        })

        socket.on('sendMessage', (message, callback) => {



            console.log(message)
            socket.broadcast.emit('chat-message', message)
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

