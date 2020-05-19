'use strict';

//MONGODB
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://dbUser:YOFwbi6x3P5o3H4d@cluster0-seh3x.mongodb.net/test?authSource=admin&replicaSet=Cluster0-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true"

const dbName = 'ParkGames';
const collectionUsers = 'Users'
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

// ----------------------------------------SIGNUP----------------------------------------

//@endpoint POST /SignUp
//@desc Sign up user info.
//@access PUBLIC
const handleSignUp = async (req, res) => {

    //get from body.
    let filePath = req.file.path;
    let name = req.body.name;
    let pass = req.body.pass;
    //initialize into new var.
    let signUpInfo = {
        user: name,
        pass: pass
    }

    //check if any of the fields are empty.
    if (!signUpInfo.user || !signUpInfo.pass || !req.file) {
        res.status(401).json({ status: 401, message: "Something went wrong with user inputs. Contact Customer Support." })
    }
    else {
        //logic for pass hashing.
        const saltRounds = 10;
        let register = new Date();
        let hashedPass;
        bcrypt.hash(signUpInfo.pass, saltRounds, function (err, hash) {
            if (err) throw err;
            hashedPass = hash;
            // Store hash in your password DB.
        });
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
                                username: getUser.username,
                                accessToken: accessToken,
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
//@access PUBLIC
const handleLogin = async (req, res) => {
    let loginInfo = req.body;
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
                                accessToken: accessToken,
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
//@access PRIVATE 

const handleGetUser = async (req, res, next) => {

    //from middleware.
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



module.exports = {
    handleSignUp,
    handleLogin, handleGetUser,
}