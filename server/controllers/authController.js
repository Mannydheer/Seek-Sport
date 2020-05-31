"use strict";
require("dotenv").config();
const { Logger } = require("../config/logger");
let logger = Logger.getInstance();
const {
  getUserById,
  getUserByUserName,
  insertNewUser,
  createUserEvent,
  hashPassword,
  generateJwtToken,
  compareHashPassword,
} = require("../services/authService");
const {
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  BadRequestError,
} = require("../utils/errors");

//@endpoint GET /user/profile
//@desc authenticate user token and send back user info
//@access PRIVATE

const handleGetUser = async (req, res, next) => {
  try {
    let id = req.user.id;
    if (!id) {
      throw new BadRequestError(
        "Verification Failed. User invalid. Try refreshing the page."
      );
    }
    const checkForUser = await getUserById(id);
    if (!checkForUser) {
      throw new NotFoundError("This user does not exist. Please sign up!");
    }
    const accessToken = generateJwtToken(checkForUser._id);
    logger.debug(`AccessToken:${accessToken}`);

    res.status(200).json({
      status: 200,
      message: "User remains signed in. Token verification accepted.",
      username: checkForUser.username,
      _id: checkForUser._id,
      profileImage: checkForUser.profileImage,
      accessToken: accessToken,
    });

    //if you do, success.
  } catch (err) {
    next(err);
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
      throw new BadRequestError("Information not received when logging in.");
    }
    let checkForUser = await getUserByUserName(loginInfo.user);
    if (!checkForUser) {
      throw new NotFoundError("This user does not exist. Please sign up!");
    }
    //only comparing passwords at this points.
    let result = await compareHashPassword(
      loginInfo.pass,
      checkForUser.password
    );
    if (!result) {
      throw new UnauthorizedError("Incorrect password");
    }
    const accessToken = generateJwtToken(checkForUser._id);
    logger.debug(accessToken, "accessToken generated.");
    return res.status(200).json({
      result: result,
      status: 200,
      message: "Success. Thanks for logging in.",
      username: checkForUser.username,
      _id: checkForUser._id,
      profileImage: checkForUser.profileImage,
      accessToken: accessToken,
    });
  } catch (err) {
    next(err);
  }
};

// ----------------------------------------SIGNUP----------------------------------------
//@endpoint POST /SignUp
//@desc Sign up user info.
//@access PUBLIC
const handleSignUp = async (req, res, next) => {
  try {
    let filePath = req.file.path;
    if (!filePath || !req.body.name || !req.body.pass) {
      throw new BadRequestError(
        "Information not received. Try refreshing the page."
      );
    }
    //new user registration date
    let register = new Date();
    let signUpInfo = {
      user: req.body.name,
      pass: req.body.pass,
    };
    //see if you find the user. //check for existing user
    let checkForUser = await getUserByUserName(signUpInfo.user);
    if (checkForUser) {
      throw new ConflictError("This user already exists. Please sign in!");
    }
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
    if (!r || !userEvent) {
      throw new ConflictError(
        "Something went wrong. Contact Customer Support."
      );
    }
    logger.info(
      `New user created: Username: ${information.username} RegistrationDate: ${information.registrationDate}`
    );
    const accessToken = generateJwtToken(userId);
    logger.debug(accessToken, "accessToken generated.");
    res.status(200).json({
      status: 200,
      message: "Success. Thanks for signing up.",
      username: signUpInfo.user,
      accessToken: accessToken,
      _id: userId,
      profileImage: filePath,
    });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  handleGetUser,
  handleLogin,
  handleSignUp,
};
