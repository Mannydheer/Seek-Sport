'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
//multer
const multer = require('multer')


//built in node module
const http = require('http');
const socketio = require('socket.io');



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
    handleUserActivities
} = require('./handlers')



const { handleChat } = require('./chatHandlers');

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
io.on('connection', (socket) => {
    console.log('we have a new connections!!!')


    //now it is a socket.on, and not a io.on
    socket.on('disconnect', () => {
        console.log('USER HAS LEFT')

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




//CHAT
// app.get('/chat', handleChat)


server.listen(PORT, () => console.info(`Listening on port ${PORT}`));

