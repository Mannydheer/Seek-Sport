'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');


const { handleSignUp, handleLogin,
    handleGetUser, handleNearbySearch,
    handlePhoto,
    handleHosting,
    handleGetHosts,
    handleGetEvents,
    handleUserEvents
} = require('./handlers')

const { auth } = require('../server/middleware')

require('dotenv').config();

//data file for items

const PORT = 4000;




var app = express()
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


//endpoints.
//signup
app.post('/SignUp', handleSignUp)
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




    .listen(PORT, () => console.info(`Listening on port ${PORT}`));

