const { getConnection } = require("../connection/connection");
const dbName = "ParkGames";
const collectionUsers = "Users";
const collectionUserEvents = "UserEvents";
var ObjectId = require("mongodb").ObjectID;
require("dotenv").config();

//------------------REPOSITORY-----------------------
//Only speak to external storage.
//In this case, all data that I will be getting from MongoDB.
//---------------------------------------------------
//@endpoint GET /user/profile
// getting a particular user by id
const getUserByIdRepo = async (id) => {
  const db = getConnection().db(dbName);
  return await db.collection(collectionUsers).findOne({ _id: ObjectId(id) });
};
//handleLogin, handleSignup.
// getting a particular user by username
const getUserByUserNameRepo = async (loginInfoUser) => {
  const db = getConnection().db(dbName);
  return await db
    .collection(collectionUsers)
    .findOne({ username: loginInfoUser });
};
//handleSignup.
//inserts a new user.
const insertNewUserRepo = async (information) => {
  const db = getConnection().db(dbName);
  return await db.collection(collectionUsers).insertOne(information);
};
//handleSignup
//in the userEvents collection, sets up the _id of the document.
//to be the same as the user.
//this way, we can add events throughout the app to his "file".
const createUserEventRepo = async (userId) => {
  const db = getConnection().db(dbName);
  return await db
    .collection(collectionUserEvents)
    .insertOne({ _id: ObjectId(userId) });
};
module.exports = {
  getUserByIdRepo,
  getUserByUserNameRepo,
  insertNewUserRepo,
  createUserEventRepo,
};
