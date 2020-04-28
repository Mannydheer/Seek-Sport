'use strict';

//MONGODB
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://dbUser:YOFwbi6x3P5o3H4d@cluster0-seh3x.mongodb.net/test?authSource=admin&replicaSet=Cluster0-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true"

const dbName = 'ParkGames';
const collectionUsers = 'Users'
const collectionHosts = 'Hosts'
const collectionEvents = 'Events'

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
//@access PRIVATE - will need to validate token? YES- add

// ------------------- HOSTING ---------------------


const handleHosting = async (req, res, next) => {

    //authorization through token gets validated first. 
    console.log('inside handle hOSTINGLSDKJFLKDSJFLJSFJSDFLKJSDFLKJ')

    let hostingInformation = req.body.hostingInformation
    let eventInformation = req.body.eventInformation

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
            let findhost = await db.collection(collectionHosts).findOne({ name: hostingInformation.name })
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
            else {
                eventInformation.hostId = findhost._id
                await db.collection(collectionEvents).insertOne(eventInformation)
                res.status(200).json({
                    status: 200,
                    message: "Already existing Host. Reservation successful. Thanks for booking!",
                    hostingInformation: hostingInformation
                })
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








module.exports = {
    handleSignUp,
    handleLogin, handleGetUser,
    handleNearbySearch, handlePhoto,
    handleHosting, handleGetHosts,
    handleGetEvents, handleUserEvents
}