'use strict';

//MONGODB
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://dbUser:YOFwbi6x3P5o3H4d@cluster0-seh3x.mongodb.net/test?authSource=admin&replicaSet=Cluster0-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true"

const dbName = 'ParkGames';
const collectionUsers = 'Users'
const collectionHosts = 'Hosts'
const collectionEvents = 'Events'
const collectionParticipants = 'Participants'
const collectionUserEvents = 'UserEvents'
const collectionRooms = 'Rooms'

const assert = require('assert')
var ObjectId = require('mongodb').ObjectID;
//
const multer = require('multer')
const fileUpload = require('express-fileupload')
//
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
//env vairablkes
require('dotenv').config();

//allows to fetch to an API from backend with fetch method API.
const fetch = require('isomorphic-fetch');

// ----------------------------------------SIGNUP----------------------------------------

//@endpoint POST /SignUp
//@desc Sign up user info.
//@access ?
const handleSignUp = async (req, res) => {


    let filePath = req.file.path;
    let name = req.body.name;
    let pass = req.body.pass;
    let signUpInfo = {
        user: name,
        pass: pass
    }

    // let hashedPass;

    //check if any of the fields are empty.
    if (!signUpInfo.user || !signUpInfo.pass || !req.file) {
        res.status(401).json({ status: 401, message: "Something went wrong with user inputs. Contact Customer Support." })
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
                    let r = await db.collection(collectionUsers).insertOne({
                        username: signUpInfo.user,
                        password: hashedPass,
                        registrationDate: register,
                        profileImage: filePath
                    })
                    assert(1, r.insertedCount)
                    let getUser = await db.collection(collectionUsers).findOne({ username: signUpInfo.user })
                    let userId = r.ops[0]._id;

                    let createUserEvent = await db.collection(collectionUserEvents).insertOne({ _id: ObjectId(userId) })

                    Promise.all([r, getUser, createUserEvent])
                        .then(() => {
                            //create jwt token here.
                            //get env, keep in mind how jwt is decontructed, header, payload
                            const accessToken = jwt.sign({ id: getUser._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '50m' })
                            res.status(200).json({
                                status: 200,
                                message: "Success. Thanks for signing up.",
                                username: getUser.username, accessToken,
                                _id: getUser._id,
                                profileImage: getUser.profileImage
                            })
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
                //find based on ID
                let checkForUser = await db.collection(collectionUsers).findOne({ username: loginInfo.user })
                //if you do, success. 
                if (checkForUser) {
                    bcrypt.compare(loginInfo.pass, checkForUser.password, function (err, result) {
                        //compare the password:
                        if (result) {
                            const accessToken = jwt.sign({ id: checkForUser._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' })
                            //CHECK SENDING ACCESS TOKEN
                            res.status(200).json({
                                result: result,
                                status: 200,
                                message: "Success. Thanks for logging in.",
                                username: checkForUser.username,
                                accessToken,
                                _id: checkForUser._id,
                                profileImage: checkForUser.profileImage
                            })
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
            res.status(200).json({
                status: 200, message: "User remains signed in. Token verification accepted.",
                username: checkForUser.username,
                accessToken: checkForUser.accessToken,
                _id: checkForUser._id,
                profileImage: checkForUser.profileImage
            })
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

    let hostingInformation = req.body.hostingInformation;
    let eventInformation = req.body.eventInformation;
    let startDate = eventInformation.time;
    let duration = eventInformation.duration;

    //pseudocode for time coonflicts.
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
            // let userHost = await db.collection(collectionUsers).findOne({ _id: ObjectId(hostingInformation.userId) })

            let validBooking = false;
            let validBookingAllEvents = false;

            //if you dont find a host.
            //will only run once... see if you can refactor this..
            if (!findhost) {

                //make a new host because there are no event related to this host.
                //insert the hosting info into DB
                await db.collection(collectionHosts).insertOne(hostingInformation)
                    //then get back the _id of the host and insert into the event.
                    .then(async (data) => {
                        //give the event key the refernece to the hostId.
                        //data.ops[0]._id is the hosts object ID.
                        try {
                            eventInformation.hostId = data.ops[0]._id
                            let eventInfo = await db.collection(collectionEvents).insertOne(eventInformation)
                            //insert as participant.
                            let eventId = eventInfo.ops[0]._id;
                            //then we need to make the host a participant as well.
                            //also since this will only happen once, will add also the host information as a participant.
                            //push the details of the participant a document.
                            hostingInformation.parkId = eventInformation.parkId
                            let r = await db.collection(collectionParticipants).insertOne({ participants: [hostingInformation] })
                            assert(1, r.insertedCount)
                            //then assign the event with that participants Id object
                            let participantId = r.ops[0]._id;
                            let r2 = await db.collection(collectionEvents).updateOne({ _id: ObjectId(eventId) }, { $set: { participantId: participantId } })
                            assert(1, r2.modifiedCount)
                            assert(1, r2.matchedCount)

                            let r3 = await db.collection(collectionRooms)
                                .insertOne({ _id: `${eventId}-First-Room`, participantId: participantId })
                            assert(1, r3.insertedCount)

                            let addUserEvent = await db.collection(collectionUserEvents).updateOne({ _id: ObjectId(hostingInformation.userId) }, { $push: { events: eventId } })
                            assert(1, addUserEvent.matchedCount)
                            assert(1, addUserEvent.modifiedCount)



                            res.status(200).json({
                                status: 200,
                                message: "New Host Reservation successful. Thanks for booking! Also you were added as a participant",
                                hostingInformation: hostingInformation
                            })
                        }
                        catch (err) {
                            console.log(err, 'error occured inside handlehsoting catch in the .then async')
                        }
                    })
            }
            //if a matching host is found in the Hosts collection.
            else {


                //if a host exists, you can get all events related to that host.
                //find all events related to the host. 
                //allEvents will get ALL THE EVENTS of that user... or host on the day he is trying to host. 
                let allEvents = await db.collection(collectionEvents).find({ userId: hostingInformation.userId, bookedDate: eventInformation.bookedDate }).toArray()
                if (!allEvents) {
                    //if you don't have anything, then there are no issues booking.
                    validBooking = true;
                    validBookingAllEvents = true;
                }
                //if there are events under this host 
                else {

                    //allEvents only has the events related to the current host... 

                    //filter the events that are held at the CURRENT park at which the host is trying to book.
                    let filteredEvents = allEvents.filter(event => {
                        if (event.parkId === eventInformation.parkId) {
                            return event
                        }
                    })
                    //filter and get back all the events related to that host at ANY park.
                    //EXCLUDING the current park.
                    //this is so we can seperate the messages we want to send back to the front end.
                    //if its an error due to the same park or due to another park.
                    let filteredEventsAllParks = allEvents.filter(event => {
                        if (event.parkId !== eventInformation.parkId) {
                            return event
                        }
                    })

                    //if current host has not booked any events at any other park...
                    //if this passes then first bool text passes so there arnt any time conflicts from any other events at any park.
                    if (filteredEventsAllParks.length === 0) {
                        console.log('inside 1 bool')
                        validBookingAllEvents = true;
                    }
                    //if we do find events from that host at different parks on the same day
                    //then we need to make sure there are no time conflicts with the park that
                    //we are currently trying to book with.
                    else {

                        //---------------------TIME ----------------------------
                        let d = new Date();
                        //get the currentMinutes - live time.
                        let currentMinutes = d.getHours() * 60 + d.getMinutes()
                        // get the time in minutes that the person tried booked.
                        let startMinutes = (new Date(startDate).getHours() * 60) + (new Date(startDate).getMinutes())
                        // convert the duration to minutes.
                        let durationMinutes = parseInt(duration) * 60;
                        // get the end minutes (duration + the start.)
                        let endMinutes = startMinutes + durationMinutes;
                        //NOW we need to check if any of the other park times are WITHIN these times.
                        //this will be a range ...
                        //if so ... then there is a conflict.

                        //CHECKING TIME CONFLICTS AT ALL THE PARKS THIS USER IS HOSTINGS EVENTS.
                        filteredEventsAllParks.forEach((event) => {

                            //for each event, grab the start time.
                            //NOW we get the range for the starting and ending time of each of the events.
                            //now we will check...
                            //if the start time of the event is within the range of the current event time,
                            //or if the end time is within that range...
                            //then there is a conflict.
                            //we will check for each of the events.
                            let eventStartTime = new Date(event.time).getHours() * 60 + (new Date(event.time).getMinutes());
                            let eventEndTime = event.duration * 60 + eventStartTime;
                            console.log('inside foreachjhgjhgjh')
                            console.log(currentMinutes, 'current minutes')
                            console.log(eventEndTime, 'event duration time')
                            console.log(eventStartTime, 'event start time.')
                            console.log(startMinutes, 'START MINUTES')
                            console.log(endMinutes, 'endmimutes')
                            //see if the start time is within the start-end time for the current booking.
                            //checking if start minutes is within the event range and if the end minutes is within the range.
                            //if one of them are true... then there is a time conflict.
                            if (startMinutes <= eventEndTime && startMinutes >= eventStartTime
                                || endMinutes <= eventEndTime && endMinutes >= eventStartTime) {
                                // timeConflict = true;
                                validBookingAllEvents = false;
                                res.status(409).json({
                                    status: 409,
                                    message: "Time conflict. Seems like you have other bookings during these hours at a different park.",
                                    timeConflictPark: event
                                })
                                return;
                            }
                            //if there wasnt any time conflicts, set bool of first test to true.
                            else {
                                validBookingAllEvents = true;
                                return
                            }
                        });
                    }

                    //second validation for events at the SAME park.
                    if (filteredEvents.length === 0) {
                        console.log('inside 1 bool')
                        validBooking = true
                    }
                    //filtered events holds at least one park, by the same user, on the same day.
                    else {

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

                        //now check for the time.
                        //CHECKING TIME CONFLICTS AT THE SPECIFIC PARK HE IS TRYING TO HOST.
                        // let timeConflict = false;
                        filteredEvents.forEach((event) => {


                            //for each event, grab the start time.
                            let eventStartTime = new Date(event.time).getHours() * 60 + (new Date(event.time).getMinutes());
                            let eventEndTime = event.duration * 60 + eventStartTime;
                            console.log('inside foreach')
                            console.log(currentMinutes, 'current minutes')
                            console.log(eventEndTime, 'event duration time')
                            console.log(eventStartTime, 'event start time.')
                            console.log(startMinutes, 'START MINUTES')
                            console.log(endMinutes, 'endmimutes')
                            //see if the start time is within the start-end time for the current booking.
                            if (startMinutes <= eventEndTime && startMinutes >= eventStartTime
                                || endMinutes <= eventEndTime && endMinutes >= eventStartTime) {

                                //also check if its the same day. becuase it it isnt
                                if (event.bookedDate === eventInformation.bookedDate) {
                                    // timeConflict = true;
                                    validBooking = false;
                                    res.status(409).json({
                                        status: 409,
                                        message: "There is a time conflict. You have already booked at this park during this time range.",
                                        timeConflictPark: event
                                    })
                                    return;
                                }
                                else {
                                    //if there are no time conflicts
                                    validBooking = true;
                                    return
                                }
                            } else {
                                validBooking = true;
                                return
                            }

                        });
                        console.log(validBookingAllEvents, validBooking)
                        //everything passes so the booking can go through.
                    }
                }
            }

            //HERE WILL BE THE FINAL TEST.
            if (validBooking && validBookingAllEvents) {
                eventInformation.hostId = findhost._id
                //meaning an event was successfully created.
                let eventInfo = await db.collection(collectionEvents).insertOne(eventInformation)
                //grab the id of that event.
                let eventId = eventInfo.ops[0]._id;
                //get the event info.



                //then we need to make the host a participant as well
                //also since this will only happen once, will add also the host information as a participant.
                //push the details of the participant a document.
                hostingInformation.parkId = eventInformation.parkId
                let r = await db.collection(collectionParticipants).insertOne({ participants: [hostingInformation] })
                assert(1, r.insertedCount)
                //then assign the event with that participants Id object
                let participantId = r.ops[0]._id;
                let r2 = await db.collection(collectionEvents).updateOne({ _id: ObjectId(eventId) }, { $set: { participantId: participantId } })
                assert(1, r2.modifiedCount)
                assert(1, r2.matchedCount)
                //also you need to add the event you joined into the userEvent collection.

                //also need to reupdate the room.
                //also if a there is a new reservation by the host, a room document needs to be recreated.

                let r3 = await db.collection(collectionRooms)
                    .insertOne({ _id: `${eventId}-First-Room`, participantId: participantId })
                assert(1, r3.insertedCount)

                //also a host should be registered in his own events.
                //inside the collectionUserEvents.

                let addUserEvent = await db.collection(collectionUserEvents).updateOne({ _id: ObjectId(hostingInformation.userId) }, { $push: { events: eventId } })
                assert(1, addUserEvent.matchedCount)
                assert(1, addUserEvent.modifiedCount)



                console.log(validBooking)
                res.status(200).json({
                    status: 200,
                    message: "Reservation successful. Thanks for booking! Keep in mind you have other events under your name. Also you've been added as a participant",
                    hostingInformation: hostingInformation
                })

            } else {
                res.status(400).json({ status: 400, message: "Booking was not valid - time conflicts." })
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
//@access PRIVATE - will need to validate token? YES
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
            let allData = await db.collection(collectionEvents).find({ userId: _id }).toArray()
            if (!allData) {
                res.status(404).json({ status: 404, message: 'There are no events booked.' })
            } else {
                let participants = [];
                allData.forEach(data => {
                    participants.push(ObjectId(data.participantId))
                })
                let participantData = await db.collection(collectionParticipants).find({ _id: { $in: participants } }).toArray();

                res.status(200).json({
                    status: 200,
                    message: "Success getting all events associated with the user!",
                    events: allData,
                    participants: participantData
                })
            }
            //
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
            // //grab the event
            let getEvent = await db.collection(collectionEvents).findOne({ _id: ObjectId(eventInformation._id) })
            //see if there is a participant ID in that event. If so then there are at least 1 participant.
            //if there is a participant ID.
            //check if that participant doesnt already exist... in that event. 
            let getParticipants = await db.collection(collectionParticipants)
                .findOne({ _id: ObjectId(getEvent.participantId) })
            //if you get participants. Which you will 100% because if you have a apeticipant ID then there are participants
            //Look at if case just before.
            if (getParticipants) {
                //check if any of the participants in the array match the current participant trying to join.
                let existingParticipant = getParticipants.participants.find(participant => {
                    if (participant.userId == participantDetails.userId) {
                        return true
                    }
                })
                //if they do match...
                if (existingParticipant) {
                    res.status(400).json({ status: 400, message: "You are already registered in this event." })
                }
                else {
                    //if you don't find a matching participant.
                    //add the incoming participant to that.
                    //adding participants
                    let updateParticipant = await db.collection(collectionParticipants).updateOne({ _id: ObjectId(eventInformation.participantId) }, { $push: { participants: participantDetails } })
                    assert(1, updateParticipant.matchedCount)
                    assert(1, updateParticipant.modifiedCount)

                    //when signing up, you create a _id = to the userId in the collectionUserEvents.
                    //now we will push the event id in the array in this event to keep track of which events the user JOINED!
                    let addUserEvent = await db.collection(collectionUserEvents).updateOne({ _id: ObjectId(participantDetails.userId) }, { $push: { events: participantDetails.eventId } })
                    assert(1, addUserEvent.matchedCount)
                    assert(1, addUserEvent.modifiedCount)

                    res.status(200).json({ status: 200, message: "Successfully joined the event!" })
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

//@endpoint POST /leaveEvent
//@desc leave the event selected from ViewActivity comp.
//@access PRIVATE - will need to validate token? YES
const handleLeaveEvent = async (req, res, next) => {

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
            // //grab the event
            await db.collection(collectionEvents).findOne({ _id: ObjectId(eventInformation._id) })
            //now you have the participant ID.
            //now get all the participants related to that event.
            //removing participants
            //find the participant collect from the event ParticipantId key.
            //now within that, remove the participant
            let updateParticipant = await db.collection(collectionParticipants)
                .updateOne({ _id: ObjectId(eventInformation.participantId) }, { $pull: { participants: { userId: participantDetails.userId } } })

            assert(1, updateParticipant.matchedCount)
            assert(1, updateParticipant.modifiedCount)

            //must also remove your event from the UserEvents collection.
            let removeUserEvent = await db.collection(collectionUserEvents)
                .updateOne({ _id: ObjectId(participantDetails.userId) }, { $pull: { events: eventInformation._id } })

            console.log(removeUserEvent)



            assert(1, removeUserEvent.matchedCount)
            assert(1, removeUserEvent.modifiedCount)


            res.status(200).json({ status: 200, message: "Successfully left the event!" })
        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleLeaveEvent')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}

//@endpoint POST /cancelEvent
//@desc cancel the event selected 
//@access PRIVATE - will need to validate token? YES
const handleCancelEvent = async (req, res, next) => {
    console.log('INSIDE CANCEL EVENT')

    const eventId = req.body.eventId



    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    //dsfsdfasddsa
    //connect to db
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in handleCancelEvent")
        try {
            const db = client.db(dbName)
            let eventInfo = await db.collection(collectionEvents).findOne({ _id: ObjectId(eventId) })
            let participantId = eventInfo.participantId;

            //delete room.
            let getRoom = await db.collection(collectionRooms).find
            let deleteRoom = await db.collection(collectionRooms).deleteOne({ _id: `${eventId}-First-Room` })
            assert(1, deleteRoom.deletedCount)

            //delete event
            let deletedEvent = await db.collection(collectionEvents).deleteOne({ _id: ObjectId(eventId) })
            assert(1, deletedEvent.deletedCount)

            //pseudo
            //also must remove all users that were registered for this event. 
            //since we have the eventId... we can get the participantId and find the participants from the participant collection.
            //now we have access to all the userIds from each participants.
            //now for each user, we need to find the event being canceled in their array and delete it.
            //now we need to find all users from the collectionUserEvents and delete the event. 

            //now we have the participants.
            let getParticipants = await db.collection(collectionParticipants).findOne({ _id: ObjectId(participantId) })
            //we get an array.
            await getParticipants.participants.forEach(async (participant) => {
                let removeUserEvent = await db.collection(collectionUserEvents).findOneAndUpdate({ _id: ObjectId(participant.userId) }, { $pull: { events: ObjectId(eventId) } })
                console.log(removeUserEvent)
            })

            //deleted participants.
            let deletedParticipants = await db.collection(collectionParticipants).deleteOne({ _id: ObjectId(participantId) })
            console.log(deletedParticipants.deletedCount)
            assert(1, deletedParticipants.deletedCount)





            res.status(200).json({ status: 200, message: "Successfully canceled the event!" })
        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleCancelEvent')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}


//@endpoint POST /viewActivityEvents
//@desc get all events associated with that park.
//@access PRIVATE - will need to validate token? YES
const handleViewActivityEvents = async (req, res, next) => {

    let parkId = req.body.selectedPark;
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    //dsfsdfasddsa
    //connect to db
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in handleViewActivityEvents")
        try {
            const db = client.db(dbName)
            //insert the hosting info into DB
            let allData = await db.collection(collectionEvents).find({ parkId: parkId }).toArray()

            console.log(allData)
            if (!allData) {
                res.status(404).json({ status: 404, message: 'There are no events booked.' })
            } else {
                let participants = [];
                allData.forEach(data => {
                    participants.push(ObjectId(data.participantId))
                })
                let participantData = await db.collection(collectionParticipants).find({ _id: { $in: participants } }).toArray();

                res.status(200).json({
                    status: 200,
                    message: "Success getting all events associated with the user!",
                    participants: participantData
                })
            }
            //
        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleViewActivityevents')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}



//@endpoint POST /viewActivityEvents
//@desc get all events associated with that park.
//@access PRIVATE - will need to validate token? YES
const handleCurrentEventParticipants = async (req, res, next) => {

    let participantId = req.params.participantId
    console.log(participantId, 'id in current')


    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    //dsfsdfasddsa
    //connect to db
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in handleViewActivityEvents")
        try {
            const db = client.db(dbName)
            //insert the hosting info into DB
            let participantData = await db.collection(collectionParticipants).findOne({ _id: ObjectId(participantId) })
            if (!participantData) {
                res.status(400).json({ status: 400, message: "Currently no participants registered for this event." })
            }
            else {
                res.status(200).json({
                    status: 200,
                    message: "Success getting participants for single event.",
                    eventParticipants: participantData.participants
                })
            }
            //
        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleViewActivityevents')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}


//@endpoint GET /selectedParkEvents
//@desc get all events associated with the selected park.
//@access PRIVATE - will need to validate token? YES
//NOTES - CHECK HANDLEGETEVENTS
const handleSelectedParkEvents = async (req, res, next) => {

    let parkId = req.params.parkId;

    console.log(parkId, 'HANDLESELECTEDPARKEVENTS')


    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    //connect to db
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in handleSelectedParkEvents")
        try {
            const db = client.db(dbName)
            //insert the hosting info into DB
            await db.collection(collectionEvents).find({ parkId: parkId })
                .toArray()
                .then(data => {

                    res.status(200).json({
                        status: 200,
                        message: "Success getting all events for selected park!",
                        events: data
                    })
                })

        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleSelectedParkEvents')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}


//@endpoint GET /userActivities
//@desc get all events that the user joined
//@access PRIVATE - will need to validate token? YES
const handleUserActivities = async (req, res, next) => {

    let userId = req.params.userId;
    console.log(userId, 'inside handleuseracitivties')



    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    //connect to db
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in handleSelectedParkEvents")
        try {
            const db = client.db(dbName)
            let userData = await db.collection(collectionUserEvents).findOne({ _id: ObjectId(userId) })
            console.log(userData)

            //if you have never signed up for any events yet.

            if (!userData.events) {
                res.status(400).json({
                    status: 400,
                    message: 'Seems like you are new, you may head to the home page to find activities or talk to our chatbot!'
                })
            }
            else {
                //if you registered for events.
                let allEvents = [];
                userData.events.forEach(event => {
                    allEvents.push(ObjectId(event))
                })
                let eventData = await db.collection(collectionEvents)
                    .find({ _id: { $in: allEvents } })
                    .toArray();

                if (eventData.length > 0) {
                    res.status(200).json({ status: 200, message: 'Success getting all events you have registered for!', events: eventData })
                }
                else {
                    res.status(400).json({ status: 400, message: 'Seems like you have no registered to any events! Head to the home page to find activities!' })
                }
                //find all the events that you have registered for.
            }
        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleSelectedParkEvents')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}

//@endpoint GET /userRegisteredEvents/:_id
//@desc get registered events associated with current user logged in.
//@access PRIVATE - will need to validate token? YES
const handleUserRegisteredEvents = async (req, res, next) => {

    const id = req.params._id;
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    //dsfsdfasddsa
    //connect to db
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in handleUserRegisteredEvents ")
        try {
            const db = client.db(dbName)
            //insert the hosting info into DB
            let allData = await db.collection(collectionUserEvents).findOne({ _id: ObjectId(id) })
            console.log(allData)
            if (!allData.events) {
                res.status(404).json({ status: 404, message: 'There are no registered events under this user.' })
            } else {
                res.status(200).json({
                    status: 200,
                    message: "Success getting all registered events associated with the user!",
                    userRegisteredEvents: allData.events,
                })
            }
            //
        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleUserRegisteredEvents ')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}


//@endpoint GET /getChatRoom
//@desc get chat room ID for specified EVENT.
//@access PRIVATE - will need to validate token? YES - add...
const handleGetChatRoom = async (req, res, next) => {
    const eventId = req.params.eventId;
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    //dsfsdfasddsa
    //connect to db
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in handleGetChatRoom ")
        try {
            const db = client.db(dbName)
            let eventData = await db.collection(collectionEvents).findOne({ _id: ObjectId(eventId) })
            //since we are making a participant ID as soon as we host an event.
            //so check if there is no event.
            if (!eventData) {
                res.status(404).json({ status: 404, message: 'There are no events.' })
            } else {
                //since the participantId is the room ID...
                res.status(200).json({
                    status: 200,
                    message: "Success getting participantID events associated with the event.",
                    participantId: eventData.participantId
                })
            }
        }
        catch (error) {
            console.log(error.stack, 'Catch Error in handleGetChatRoom ')
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
    handleJoinEvent, handleViewActivityEvents,
    handleLeaveEvent, handleCurrentEventParticipants,
    handleCancelEvent, handleSelectedParkEvents,
    handleUserActivities, handleUserRegisteredEvents,
    handleGetChatRoom,
}