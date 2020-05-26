"use strict";
require("dotenv").config();
const {
  getUserById,
  getUserByUserName,
  insertNewUser,
  createUserEvent,
  hashPassword,
  generateJwtToken,
  compareHashPassword,
} = require("../services/authService");
const { NotFoundError } = require("../utils/errors");

//@endpoint GET /user/profile
//@desc authenticate user token and send back user info
//@access PRIVATE

const handleGetUser = async (req, res, next) => {
  try {
    let id = req.user.id;
    if (!id) {
      return res.status(400).json({
        status: 400,
        message: "Verification Failed. User invalid. Try refreshing the page.",
      });
    }
    const checkForUser = await getUserById(id);
    if (!checkForUser) {
      return res.status(400).json({ status: 400, message: "User not found." });
    }
    const accessToken = generateJwtToken(checkForUser._id);
    res.status(200).json({
      status: 200,
      message: "User remains signed in. Token verification accepted.",
      username: checkForUser.username,
      _id: checkForUser._id,
      profileImage: checkForUser.profileImage,
      accessToken: accessToken,
    });

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
const handleLogin = async (req, res, next) => {
  //check if any data came.
  try {
    let loginInfo = req.body;
    if (!loginInfo) {
      throw new NotFoundError();
    }
    let checkForUser = await getUserByUserName(loginInfo.user);
    if (!checkForUser) {
      return res.status(404).json({
        status: 404,
        message: "This user does not exist. Please sign up!",
      });
    }
    //only comparing passwords at this points.
    let result = await compareHashPassword(
      loginInfo.pass,
      checkForUser.password
    );
    if (!result) {
      let err = new NotFoundError("Wrong password");
      next(err);
    }
    const accessToken = generateJwtToken(checkForUser._id);
    return res.status(200).json({
      result: result,
      status: 200,
      message: "Success. Thanks for logging in.",
      username: checkForUser.username,
      _id: checkForUser._id,
      profileImage: checkForUser.profileImage,
      accessToken: accessToken,
    });
  } catch (error) {
    console.log(error.stack, "Catch Error in handleLogin");
    res.status(500).json({ status: 500, message: error.message });
  }
};

// ----------------------------------------SIGNUP----------------------------------------
//@endpoint POST /SignUp
//@desc Sign up user info.
//@access PUBLIC
const handleSignUp = async (req, res) => {
  try {
    let filePath = req.file.path;
    //new user registration date
    let register = new Date();
    let signUpInfo = {
      user: req.body.name,
      pass: req.body.pass,
    };
    //see if you find the user. //check for existing user
    let checkForUser = await getUserByUserName(signUpInfo.user);
    if (!checkForUser) {
      let hashedPass = await hashPassword(signUpInfo.pass);
      let information = {
        username: signUpInfo.user,
        password: hashedPass,
        registrationDate: register,
        profileImage: filePath,
      };
      let r = await insertNewUser(information);
      let userId = r.ops[0]._id;
      //give the same _id of the user to the collectionUserEvents.
      //to keep track of all the events a user is participating in.
      let userEvent = await createUserEvent(userId);
      if (r && userEvent) {
        const accessToken = generateJwtToken(userId);
        res.status(200).json({
          status: 200,
          message: "Success. Thanks for signing up.",
          username: signUpInfo.user,
          accessToken: accessToken,
          _id: userId,
          profileImage: filePath,
        });
      } else {
        res.status(404).json({
          status: 401,
          message: "Something went wrong. Contact Customer Support.",
        });
      }
      //
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
};
module.exports = {
  handleGetUser,
  handleLogin,
  handleSignUp,
};
