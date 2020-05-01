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

            //if you dont find a host.
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
                            await db.collection(collectionEvents).updateOne({ _id: ObjectId(eventId) }, { $set: { participantId: participantId } })
                            assert(1, r.modifiedCount)
                            assert(1, r.matchedCount)

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
            //if a matching host is found.
            else {
                //if a host exists, you can get all events related to that host.
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
                                        timeConflict = true;
                                        res.status(400).json({ status: 400, message: "There is a time conflict. You have already booked at this park during this time range." })
                                        return;
                                    }

                                }
                            } catch (err) { err }

                        });

                        //everything passes so the booking can go through.
                        if (!timeConflict) {
                            eventInformation.hostId = findhost._id
                            //meaning an event was successfully created.
                            let eventInfo = await db.collection(collectionEvents).insertOne(eventInformation)
                            //grab the id of that event.
                            let eventId = eventInfo.ops[0]._id;
                            //then we need to make the host a participant as well

                            //also since this will only happen once, will add also the host information as a participant.
                            //push the details of the participant a document.
                            hostingInformation.parkId = eventInformation.parkId
                            let r = await db.collection(collectionParticipants).insertOne({ participants: [hostingInformation] })
                            assert(1, r.insertedCount)
                            //then assign the event with that participants Id object
                            let participantId = r.ops[0]._id;
                            await db.collection(collectionEvents).updateOne({ _id: ObjectId(eventId) }, { $set: { participantId: participantId } })
                            assert(1, r.modifiedCount)
                            assert(1, r.matchedCount)
                            //also you need to add the event you joined into the userEvent collection.


                            res.status(200).json({
                                status: 200,
                                message: "Reservation successful. Thanks for booking! Keep in mind you have other events under your name. Also you've been added as a participant",
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


            //delete event
            let deletedEvent = await db.collection(collectionEvents).deleteOne({ _id: ObjectId(eventId) })
            assert(1, deletedEvent.deletedCount)

            //deleted participants.
            let deletedParticipants = await db.collection(collectionParticipants).deleteOne({ _id: ObjectId(participantId) })
            assert(1, deletedParticipants.deletedCount)
            // console.log(deletedParticipants)
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











module.exports = {
    handleSignUp,
    handleLogin, handleGetUser,
    handleNearbySearch, handlePhoto,
    handleHosting, handleGetHosts,
    handleGetEvents, handleUserEvents,
    handleJoinEvent, handleViewActivityEvents,
    handleLeaveEvent, handleCurrentEventParticipants,
    handleCancelEvent, handleSelectedParkEvents,
    handleUserActivities
}