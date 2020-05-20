"use strict";

const dbName = "ParkGames";
const collectionUsers = "Users";
const collectionUserEvents = "UserEvents";
const assert = require("assert");
var ObjectId = require("mongodb").ObjectID;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//env vairablkes

require("dotenv").config();
const { getConnection } = require("../connection/connection");
const {
  getUserById,
  getUserByUserName,
  insertNewUser,
  createUserEvent,
} = require("../services/authService");

//@endpoint GET /user/profile
//@desc authenticate user token and send back user info
//@access PRIVATE

const handleGetUser = async (req, res, next) => {
  try {
    let id = req.user.id;
    if (!id) {
      res.status(400).json({
        status: 400,
        message: "Verification Failed. User invalid. Try refreshing the page.",
      });
    } else {
      const checkForUser = await getUserById(id);
      if (!checkForUser) {
        res.status(400).json({ status: 400, message: "User not found." });
      }
      res.status(200).json({
        status: 200,
        message: "User remains signed in. Token verification accepted.",
        username: checkForUser.username,
        _id: checkForUser._id,
        profileImage: checkForUser.profileImage,
        accessToken: accessToken,
      });
    }
    //if you do, success.
  } catch (error) {
    console.log(error.stack, "Catch Error in handleGetUser");
    res.status(500).json({ status: 500, message: error.message });
  }
};
// ----------------------------------------LOGIN - AUTHENTICATION----------------------------------------
// @endpoint POST /Login
// @desc authenticate user info.
// @access PUBLIC
const handleLogin = async (req, res) => {
  let loginInfo = req.body;
  //check if any data came.
  if (!loginInfo.user || !loginInfo.pass) {
    res.status(401).json({
      status: 401,
      message: "Missing field. Please enter all fields.",
    });
  } else {
    try {
      let checkForUser = await getUserByUserName(loginInfo.user);
      if (checkForUser) {
        bcrypt.compare(loginInfo.pass, checkForUser.password, function (
          err,
          result
        ) {
          //compare the password:
          if (result) {
            const accessToken = jwt.sign(
              { id: checkForUser._id },
              process.env.ACCESS_TOKEN_SECRET,
              { expiresIn: "10m" }
            );
            //CHECK SENDING ACCESS TOKEN
            res.status(200).json({
              result: result,
              status: 200,
              message: "Success. Thanks for logging in.",
              username: checkForUser.username,
              _id: checkForUser._id,
              profileImage: checkForUser.profileImage,
              accessToken: accessToken,
            });
          } else {
            res.status(404).json({
              result: result,
              status: 401,
              message: "Incorrect password.",
            });
          }
        });
      } else {
        res.status(404).json({
          status: 404,
          message: "This user does not exist. Please sign up!",
        });
      }
    } catch (error) {
      console.log(error.stack, "Catch Error in handleLogin");
      res.status(500).json({ status: 500, message: error.message });
    }
  }
};

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
    pass: pass,
  };
  //check if any of the fields are empty.
  if (signUpInfo.user && signUpInfo.pass && req.file) {
    //logic for pass hashing.
    const saltRounds = 10;
    let register = new Date();
    let hashedPass;
    bcrypt.hash(signUpInfo.pass, saltRounds, function (err, hash) {
      if (err) throw err;
      hashedPass = hash;
      // Store hash in your password DB.
    });
    try {
      //see if you find the user. //check for existing user
      let checkForUser = await getUserByUserName(signUpInfo.user);
      if (!checkForUser) {
        let information = {
          username: signUpInfo.user,
          password: hashedPass,
          registrationDate: register,
          profileImage: filePath,
        };
        let r = await insertNewUser(information);
        let userId = r.ops[0]._id;
        let getUser = await getUserByUserName(signUpInfo.user);
        //give the same _id of the user to the collectionUserEvents.
        //to keep track of all the events a user is participating in.
        //This way it is relational.
        let userEvent = await createUserEvent(userId);

        if (r && getUser && userEvent) {
          Promise.all([r, getUser, userEvent]).then(() => {
            //create jwt token here.
            const accessToken = jwt.sign(
              { id: getUser._id },
              process.env.ACCESS_TOKEN_SECRET,
              { expiresIn: "50m" }
            );
            res.status(200).json({
              status: 200,
              message: "Success. Thanks for signing up.",
              username: getUser.username,
              accessToken: accessToken,
              _id: getUser._id,
              profileImage: getUser.profileImage,
            });
          });
        } else {
          res.status(404).json({
            status: 401,
            message: "Something went wrong. Contact Customer Support.",
          });
        }
      } else {
        //if there is already a user.
        res.status(404).json({
          status: 404,
          message: "This user already exists. Please sign in!",
        });
      }
    } catch (error) {
      console.log(error.stack, "Catch Error in handleSignUp");
      res.status(500).json({ status: 500, message: error.message });
    }
  } else {
    res.status(401).json({
      status: 401,
      message:
        "Something went wrong with user inputs. Contact Customer Support.",
    });
  }
};
module.exports = {
  handleGetUser,
  handleLogin,
  handleSignUp,
};
