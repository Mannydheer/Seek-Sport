'use strict';

const express = require('express');
const bodyParser = require('body-parser');

//
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

const users = []




const addUser = ({ id, name, room }) => {
    let existingUser = users.find(user => {
        if (user.name === name) {
            return user
        }
    })

    if (existingUser) {
        return { error: "existing user" }
    }
    else {
        const userInfo = {
            id: id,
            name: name,
            room: room
        }
        users.push(userInfo)
    }
    return userInfo
}

const getUserChat = async ({ name, userId, room }) => {
    console.log(name, userId, room, 'INSIDE ADDUSER CHAT')

    //connect to db
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in getUserChat")
        try {
            //see if the user is is allowed to join the chat.
            const db = client.db(dbName)
            //see if you find the user. //check for existing user
            //get the participants Object.
            let checkForUser = await db.collection(collectionRooms).findOne({ _id: ObjectId(room) })
            //now check if current user is allowed to join by checking if he is a participant in the event.
            let match = checkForUser.chatParticipants.find(user => {
                if (user.userId === userId) {
                    return user
                }
            })
            //if no match...
            if (!match) {
                let error = "No matching user found in the chat room."
                return error
            }
            else {
                return match;
            }
        }
        catch (error) {
            console.log(error.stack, 'Catch Error in getUserChat')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}
//


const addUserChat = async ({ name, userId, room }) => {
    console.log(name, userId, room, 'INSIDE ADDUSER CHAT')
    //connect to db
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in addUserChat")
        try {
            //see if the user is is allowed to join the chat.
            const db = client.db(dbName)
            //find the participants array for that room
            let checkForUser = await db.collection(collectionParticipants).findOne({ _id: ObjectId(room) })
            //now check if current user is allowed to join by checking if he is a participant in the event.
            let match = checkForUser.participants.find(user => {
                if (user.userId === userId) {
                    return user
                }
            })
            //if no match...
            if (!match) {
                let error = "Not a participant of the event."
                return error;
            }
            //if he is authorized because he is attenting the event.
            else {
                //then we can join the room
                let userInformation = {
                    name: name,
                    userId, userId
                }
                let findRoom = await db.collection(collectionRooms).findOne({ _id: ObjectId(room) })
                //once we get the room.
                //check if the current user is already in the room.

                if (!findRoom.chatParticipants) {
                    // add a user in an array data structure.
                    let addUser = await db.collection(collectionRooms)
                        .updateOne({ _id: ObjectId(room) }, { $push: { chatParticipants: userInformation } })
                    assert(1, addUser.matchedCount)
                    assert(1, addUser.modifiedCount)
                    return userInformation
                }
                //if there is someone in the room.
                else {
                    //then check if it is the same person as the current user.
                    let existingUserInRoom = addUser.chatParticipants.find(user => {
                        if (user.userId === userId) {
                            return user
                        }
                    })
                    if (existingUserInRoom) return "Already in room."
                    else {

                        let addUser = await db.collection(collectionRooms)
                            .updateOne({ _id: ObjectId(room) }, { $push: { chatParticipants: userInformation } })
                        assert(1, addUser.matchedCount)
                        assert(1, addUser.modifiedCount)
                    }
                }
            }
        }
        catch (error) {
            return (error.stack, 'Catch Error in addUserChat')
        }

    })
}


const getUsersInRoom = async ({ room }) => {
    console.log(room, 'INSIDE ADDUSER CHAT')

    //connect to db
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    client.connect(async (err) => {
        if (err) throw { Error: err, message: "error occured connected to DB" }
        console.log("Connected to DB in getUsersInRoom")
        try {
            //see if the user is is allowed to join the chat.
            const db = client.db(dbName)
            //see if you find the user. //check for existing user
            //get the participants Object.
            let getRoom = await db.collection(collectionRooms).findOne({ _id: ObjectId(room) })
            let allUsersInRoom = getRoom.chatParticipants;

            return allUsersInRoom;


        }
        catch (error) {
            console.log(error.stack, 'Catch Error in getUsersInRoom')
            res.status(500).json({ status: 500, message: error.message })
        }
        finally {
            console.log('disconnected')
            client.close();
        }
    })
}

// const removeUserChat = async ({ name, userId, room }) => {
//     console.log(name, userId, room, 'INSIDE ADDUSER CHAT')

//     //connect to db
//     const client = new MongoClient(uri, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     });
//     client.connect(async (err) => {
//         if (err) throw { Error: err, message: "error occured connected to DB" }
//         console.log("Connected to DB in addUserChat")
//         try {
//             //see if the user is is allowed to join the chat.
//             const db = client.db(dbName)
//             //find the participants array for that room
//             let checkForUser = await db.collection(collectionParticipants).findOne({ _id: ObjectId(room) })
//             //now check if current user is allowed to join by checking if he is a participant in the event.
//             let match = checkForUser.participants.find(user => {
//                 if (user.userId === userId) {
//                     return user
//                 }
//             })
//             //if no match...
//             if (!match) {
//                 let error = "Not authorized to join the room as he is not a participant of the event.."
//                 return error;
//             }
//             //if he is authorized because he is attenting the event.
//             else {
//                 //then we check if he already joined the room.
//                 let existingUserInRoom = await db.collection(collectionRooms).findOne({ userId: userId })
//                 if (existingUserInRoom) {
//                     let error = "Already joined the room."
//                     return error;
//                 }
//                 else {
//                     //then we can join the room
//                     let userInformation = {
//                         name: name,
//                         userId, userId
//                     }
//                     let addUser = await db.collection(collectionRooms).insertOne({ _id: ObjectId(room) }, {
//                         userInformation
//                     })
//                     return userInformation
//                 }

//             }
//         }
//         catch (error) {
//             console.log(error.stack, 'Catch Error in addUserChat')
//             res.status(500).json({ status: 500, message: error.message })
//         }
//         finally {
//             console.log('disconnected')
//             client.close();
//         }
//     })
// }


module.exports = { addUser, addUserChat, getUserChat, getUsersInRoom }