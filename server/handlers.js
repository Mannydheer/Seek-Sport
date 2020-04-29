'use strict';

//MONGODB
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://dbUser:YOFwbi6x3P5o3H4d@cluster0-seh3x.mongodb.net/test?authSource=admin&replicaSet=Cluster0-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true"

const dbName = 'ParkGames';
const collectionUsers = 'Users'
const collectionHosts = 'Hosts'
const collectionEvents = 'Events'
const collectionParticipants = 'Participants'

const assert = require('assert')
var ObjectId = require('mongodb').ObjectID;

//
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
//env vairablkes
require('dotenv').config();

//allows to fetch to an API from backend with fetch method API.
const fetch = require('isomorphic-fetch');

//




// ----------------------------------------SIGNUP----------------------------------------

//@endpoint POST /SignUp
//@desc Sign up user info.
//@access ?
const handleSignUp = async (req, res) => {
    //ADD REGISTER DATE! 
    let signUpInfo = req.body;
    // let hashedPass;
    console.log(signUpInfo)

    //check if any data came. 
    if (!signUpInfo.user || !signUpInfo.pass) {
        res.status(401).json({ status: 401, message: "Missing field. Please enter all fields." })
    }
    else {

        //hash pashhed
        const saltRounds = 10;
        let register = new Date();

        let hashedPass;
        bcrypt.hash(signUpInfo.pass, saltRounds, function (err, hash) {
            if (err) throw err;
            hashedPass = hash;
            // Store hash in your password DB.
        });

        //
        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        //connect to db
        client.connect(async (err) => {
            if (err) throw { Error: err, message: "error occured connected to DB" }
            console.log("Connected to DB in handleSignup")
            try {
                const db = client.db(dbName)
                //see if you find the user. //check for existing user
                let checkForUser = await db.collection(collectionUsers).findOne({ username: signUpInfo.user })
                //if you do, success. 
                if (!checkForUser) {
                    let r = await db.collection(collectionUsers).insertOne({ username: signUpInfo.user, password: hashedPass, registrationDate: register })
                    assert(1, r.insertedCount)
                    let getUser = await db.collection(collectionUsers).findOne({ username: signUpInfo.user })
                    Promise.all([r, getUser])
                        .then(() => {
                            //create jwt token here.
                            //get env, keep in mind how jwt is decontructed, header, payload
                            const accessToken = jwt.sign({ id: getUser._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' })
                            res.status(200).json({ status: 200, message: "Success. Thanks for signing up.", username: getUser.username, accessToken, _id: getUser._id })
                        })
                }
                else {
                    //if there is already a user.
                    res.status(404).json({ status: 404, message: "This user already exists. Please sign in!" })
                }
            }
            catch (error) {
                console.log(error.stack, 'Catch Error in handleSignUp')
                res.status(500).json({ status: 500, message: error.message })
            }
            finally {
                console.log('disconnected')
                client.close();
            }
        })
    }
}
// ----------------------------------------LOGIN - AUTHENTICATION----------------------------------------

//@endpoint POST /Login
//@desc authenticate user info.
//@access PRIVATE - will need to validate token?
const handleLogin = async (req, res) => {


    let loginInfo = req.body;

    // const accessToken = jwt.sign(loginInfo.user, process.env.ACCESS_TOKEN_SECRET)
    // console.log(accessToken)


    //check if any data came. 
    if (!loginInfo.user || !loginInfo.pass) {
        res.status(401).json({ status: 401, message: "Missing field. Please enter all fields." })
    }
    else {
        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        //connect to db
        client.connect(async (err) => {
            if (err) throw { Error: err, message: "error occured connected to DB" }
            console.log("Connected to DB in handleLogin")
            try {
                const db = client.db(dbName)
                //see if you find the user. 
                let checkForUser = await db.collection(collectionUsers).findOne({ username: loginInfo.user })
                //if you do, success. 
                if (checkForUser) {
                    bcrypt.compare(loginInfo.pass, checkForUser.password, function (err, result) {
                        //compare the password:
                        if (result) {
                            const accessToken = jwt.sign({ id: checkForUser._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' })
                            //CHECK SENDING ACCESS TOKEN
                            res.status(200).json({ result: result, status: 200, message: "Success. Thanks for logging in.", username: checkForUser.username, accessToken, _id: checkForUser._id })
                        }
                        else {
                            res.status(404).json({ result: result, status: 401, message: "Incorrect password." })
                        }
                    });
                }
                else {
                    res.status(404).json({ status: 404, message: "This user does not exist. Please sign up!" })
                }
            }
            catch (error) {
                console.log(error.stack, 'Catch Error in handleLogin')
                res.status(500).json({ status: 500, message: error.message })
            }
            finally {
                console.log('disconnected')
                client.close();
            }
        })
    }
}

//@endpoint GET /user/profile
//@desc authenticate user token and send back user info
//@access PRIVATE - will need to validate token?


const handleGetUser = async (req, res, next) => {

    //from middleware.
    console.log(req.user, 'INSIDE HANDLE GET USER')
    let id = req.user.id;

    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    //connect to db
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in handleGetUser")
        try {
            const db = client.db(dbName)
            //see if you find the user. 
            let checkForUser = await db.collection(collectionUsers).findOne({ _id: ObjectId(id) })
            res.status(200).json({ status: 200, message: "User remains signed in. Token verification accepted.", username: checkForUser.username, accessToken: checkForUser.accessToken, _id: checkForUser._id })
            //if you do, success. 
        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleGetUser')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })


}
///
//@endpoint POST /nearbySearch
//@desc authenticate user token and send back user info
//@access PRIVATE - will need to validate token?

// -------------------API NEARBY SEARCH----------------------
const handleNearbySearch = async (req, res) => {
    let coordinates = req.body
    let latitude = coordinates.lat
    let longitude = coordinates.lng

    let radMetter = 2 * 1000; // Search withing 2 KM radius
    const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?location=' + latitude + ',' + longitude + '&radius=' + radMetter + '&key=' + process.env.CLIENT_SECRET_KEY + '&query=parc'
    try {
        let responseNearestPlaces = await fetch(url)
        //add error handling
        let places = await responseNearestPlaces.json()
        res.status(200).json(places)
    }
    catch (err) {
        console.log(err)
    }
}

//@endpoint POST /parkPhoto
//@desc send back selected park picture.
//@access PRIVATE - will need to validate token?

// -------------------API PHOTO---------------------

const handlePhoto = async (req, res) => {


    let photo = req.body.photo;

    console.log(photo)
    try {
        const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo}&key=${process.env.CLIENT_SECRET_KEY}`

        let responsePhoto = await fetch(url)
        if (responsePhoto.status === 200) {
            console.log(responsePhoto.url)
            res.status(200).json({ message: "Picture success", image: responsePhoto.url })
        }
        else {
            res.status(400).json({ message: "Error occured retrieving pictured. " })
        }
    }
    catch (err) {
        res.status(500).json({ message: "Error occured in handlePhoto fetch function. " })
    }
}

//@endpoint POST /hostingInformation
//@desc store the info into the database of the reservating
//@access PRIVATE - will need to validate token? YES

// ------------------- HOSTING ---------------------


const handleHosting = async (req, res, next) => {

    //authorization through token gets validated first. 
    console.log('inside handle hOSTINGLSDKJFLKDSJFLJSFJSDFLKJSDFLKJ')

    let hostingInformation = req.body.hostingInformation;
    let eventInformation = req.body.eventInformation;
    let startDate = eventInformation.time;
    let duration = eventInformation.duration;

    //pseudocode.
    //first find all the events associated with that USERID and at the SAME PARK. 
    //if there are none, everything passes and you can book at that park.
    //if found, loop through their events at that park and check if there are any time clashes.
    //if time clashes send back message saying you have already booked at that time.




    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    //connect to db
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in handleHosting")
        try {
            const db = client.db(dbName)
            //first see if the host already exists.
            let findhost = await db.collection(collectionHosts).findOne({ userId: hostingInformation.userId })
            //if you dont find a host.
            if (!findhost) {
                //make a new host
                //insert the hosting info into DB
                await db.collection(collectionHosts).insertOne(hostingInformation)
                    //then get back the _id of the host and insert into the event.
                    .then(async (data) => {
                        //give the event key the refernece to the hostId.
                        //data.ops[0]._id is the hosts object ID.
                        try {
                            eventInformation.hostId = data.ops[0]._id
                            await db.collection(collectionEvents).insertOne(eventInformation)
                            res.status(200).json({
                                status: 200,
                                message: "New Host Reservation successful. Thanks for booking!",
                                hostingInformation: hostingInformation
                            })
                        }
                        catch (err) {
                            console.log(err, 'error occured inside handlehsoting catch in the .then async')
                        }
                    })
            }
            //if a matching host is found.
            else {
                //find all events related to the host. 
                //either with ID or hostId?
                let allEvents = await db.collection(collectionEvents).find({ userId: hostingInformation.userId }).toArray()
                if (!allEvents) {
                    res.status(400).json({ message: "There are no events under this host." })
                }
                //if there are events under this host. 
                else {
                    //filter the events related to that park.
                    let filteredEvents = allEvents.filter(event => {
                        if (event.parkId === eventInformation.parkId) {
                            return event
                        }
                    })
                    if (!filteredEvents) {
                        res.status(400).json({ message: "This host has no events at the specified park under this host." })
                    }
                    else {
                        //now check for the time.
                        //---------------------TIME ----------------------------
                        let d = new Date();
                        //get the currentMinutes - live time.
                        let currentMinutes = d.getHours() * 60 + d.getMinutes()
                        // get the time in minutes that the person tried booked.
                        let startMinutes = (new Date(startDate).getHours() * 60) + (new Date(startDate).getMinutes())
                        // convert the duration to minutes.
                        let durationMinutes = parseInt(duration) * 60;
                        // get the end minutes
                        let endMinutes = startMinutes + durationMinutes;
                        //
                        let timeConflict = false;
                        await filteredEvents.forEach(async (event) => {
                            try {
                                //for each event, grab the start time.
                                let eventStartTime = new Date(event.time).getHours() * 60 + (new Date(event.time).getMinutes());
                                let eventEndTime = event.duration * 60 + eventStartTime;
                                console.log('inside foreach')
                                console.log(eventEndTime, 'event duration time')
                                console.log(eventStartTime, 'event start time.')
                                console.log(startMinutes, 'START MINUTES')
                                console.log(endMinutes, 'endmimutes')
                                //see if the start time is within the start-end time for the current booking.
                                if (startMinutes <= eventEndTime && startMinutes >= eventStartTime
                                    || endMinutes <= eventEndTime && endMinutes >= eventStartTime) {

                                    //also check if its the same day. becuase it it isnt
                                    if (event.bookedDate === eventInformation.bookedDate) {
                                        timeConflict = true;
                                        res.status(400).json({ status: 400, message: "There is a time conflict. You have already booked at this park during this time range." })
                                        return;
                                    }
                                }
                            } catch (err) { err }

                        });
                        if (!timeConflict) {
                            eventInformation.hostId = findhost._id
                            await db.collection(collectionEvents).insertOne(eventInformation)
                            res.status(200).json({
                                status: 200,
                                message: "Reservation successful. Thanks for booking! Keep in mind you have other events under your name.",
                                hostingInformation: hostingInformation
                            })
                        }
                    }
                }
            }
            //if you do, success. 
        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleHosting')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}



const handleGetHosts = async (req, res, next) => {

    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    //connect to db
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in handleGetHosts")
        try {
            const db = client.db(dbName)
            //insert the hosting info into DB
            await db.collection(collectionHosts).find()
                .toArray()
                .then(data => {
                    res.status(200).json({
                        status: 200,
                        message: "Success getting all hosts!",
                        hosts: data
                    })
                })

        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleHosting')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}

const handleGetEvents = async (req, res, next) => {

    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    //connect to db
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in handleGetEvents")
        try {
            const db = client.db(dbName)
            //insert the hosting info into DB
            await db.collection(collectionEvents).find()
                .toArray()
                .then(data => {
                    res.status(200).json({
                        status: 200,
                        message: "Success getting all events!",
                        events: data
                    })
                })

        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleEvents')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}

//@endpoint GET /userEvents/:_id
//@desc get events associated with current user logged in.
//@access PRIVATE - will need to validate token? YES- add
const handleUserEvents = async (req, res, next) => {

    const _id = req.params._id;

    console.log(_id, 'this is ID')

    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    //dsfsdfasddsa
    //connect to db
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in handleUserEvents")
        try {
            const db = client.db(dbName)
            //insert the hosting info into DB
            await db.collection(collectionEvents).find({ userId: _id })
                .toArray()
                .then(data => {
                    res.status(200).json({
                        status: 200,
                        message: "Success getting all events associated with the user!",
                        events: data
                    })
                })

        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleUserevents')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}


//@endpoint POST /joinEvent
//@desc join the event selected from ViewActivity comp.
//@access PRIVATE - will need to validate token? YES
const handleJoinEvent = async (req, res, next) => {

    const participantDetails = req.body.participantDetails
    const eventInformation = req.body.eventInformation

    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    //dsfsdfasddsa
    //connect to db
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in handleJoinEvent")
        try {
            const db = client.db(dbName)
            //grab the event
            let getEvent = await db.collection(collectionEvents).findOne({ _id: ObjectId(eventInformation._id) })

            //first check if the event has a participant id
            //if there are none, then we need to create that object inside the participants collection.
            if (!getEvent.participantId) {
                console.log('inside eventINformaiton particpssdfsf')
                //push the details of the participant a document.
                let r = await db.collection(collectionParticipants).insertOne({ participants: [participantDetails] })
                assert(1, r.insertedCount)
                //then assign the event with that participants Id object
                let participantId = r.ops[0]._id;
                await db.collection(collectionEvents).updateOne({ _id: ObjectId(eventInformation._id) }, { $set: { participantId: participantId } })
                assert(1, r.modifiedCount)
                assert(1, r.matchedCount)
                // let getEvent = await db.collection(collectionEvents).findOne({ _id: ObjectId(eventInformation._id) })

                res.status(200).json({ status: 200, message: "Your the first one to sign up! Thanks for joining the event!", event: getEvent })

            } else {
                //if there is a participant ID.
                //check if that participant doesnt already exist... in that event. 
                let getParticipants = await db.collection(collectionParticipants)
                    .findOne({ _id: ObjectId(getEvent.participantId) })
                //if you get participants. Which you will 100% because if you have a apeticipant ID then there are participants
                //Look at if case just before.
                console.log(getParticipants)
                if (getParticipants) {
                    //check if any of the participants in the array match the current participant trying to join.
                    let existingParticipant = getParticipants.participants.find(participant => {
                        if (participant.userId == participantDetails.userId) {
                            return true
                        }
                    })
                    console.log(existingParticipant)
                    //if they do match...
                    if (existingParticipant) {
                        res.status(400).json({ status: 400, message: "You are already registered in this event." })
                    }
                    else {
                        //if you don't find a matching participant.
                        //add the incoming participant to that.
                        let updateParticipant = await db.collection(collectionParticipants).updateOne({ _id: ObjectId(eventInformation.participantId) }, { $push: { participants: participantDetails } })
                        assert(1, updateParticipant.matchedCount)
                        assert(1, updateParticipant.modifiedCount)
                        res.status(200).json({ status: 200, message: "Successfully joined the event!" })
                    }

                }
            }

        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleJoinEvent')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}








module.exports = {
    handleSignUp,
    handleLogin, handleGetUser,
    handleNearbySearch, handlePhoto,
    handleHosting, handleGetHosts,
    handleGetEvents, handleUserEvents,
    handleJoinEvent
}