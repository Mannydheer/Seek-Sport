"use strict";

const dbName = "ParkGames";
const collectionUsers = "Users";
const collectionUserEvents = "UserEvents";
const assert = require("assert");
var ObjectId = require("mongodb").ObjectID;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  getUserByIdRepo,
  getUserByUserNameRepo,
  insertNewUserRepo,
  createUserEventRepo,
} = require("../repositories/authRepository");

require("dotenv").config();

//------------------SERVICE-----------------------
// the brains of the application, they control any payload manipulation/validation
//---------------------------------------------------

//get a user by _id in the user collection.
const getUserById = async (id) => {
  const checkForUser = await getUserByIdRepo(id);
  if (!checkForUser) {
    return;
  } else {
    return checkForUser;
  }
};
//Used both by /Login and /Signup endpoints.

const getUserByUserName = async (loginInfoUser) => {
  const checkForUser = await getUserByUserNameRepo(loginInfoUser);
  if (!checkForUser) {
    return;
  } else {
    return checkForUser;
  }
};
//Insert new user for Sign up.
const insertNewUser = async (information) => {
  const insertUser = await insertNewUserRepo(information);
  if (insertUser.insertedCount == 1) {
    return insertUser;
  } else return;
};

//set up for events in userCollection.
const createUserEvent = async (userId) => {
  const insertEvent = await createUserEventRepo(userId);
  if (insertEvent.insertedCount == 1) {
    return insertEvent;
  } else return;
};

module.exports = {
  getUserById,
  getUserByUserName,
  insertNewUser,
  createUserEvent,
};
