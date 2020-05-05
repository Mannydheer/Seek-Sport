import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import {
    requestChats,
    retrieveChats, retrieveChatsError,
    addMessage, leaveRoom
} from '../actions/userActions';




let socket;

const ChatJoin = () => {
    let ENDPOINT = 'localhost:4000';

    //now we have the eventId of which we want to join the chat
    //we have access to the participant ID which will be the room.
    let eventId = useParams().eventId;



    const userInfo = useSelector(state => state.userReducer);
    const userRegisteredEvents = useSelector(state => state.userRegisteredReducer)
    const userChats = useSelector(state => state.chatReducer)

    const dispatch = useDispatch();




    const [name, setName] = useState('');
    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState(null)
    const [join, setJoined] = useState(null)
    const [leaveRoomMessage, setLeaveRoomMessage] = useState(null)


    const [allMessages, setAllMessages] = useState(null);

    let userId = userInfo._id;



    //use effect on mount, will get the eventId which will be the participanID.
    //now we have access to the eventInformation... where we will use the 
    //participantId as the ROOM. 
    useEffect(() => {
        const handleGetRoomId = async () => {

            try {
                //EVENTID = PARTICIPANTID.
                let response = await fetch(`/getChatRoom/${eventId}`);
                let eventResponse = await response.json()
                console.log(eventResponse)
                if (eventResponse.status === 200) {
                    //we will get back the participantId which is the same as the roomId
                    //now we can add add socket to particular room collection.
                    setRoom(eventResponse.participantId)
                }
                else {
                    console.log('error occured')
                }
            } catch (err) {
                console.log(err)
            }
        }
        handleGetRoomId()
        //only if these two values change.
    }, [eventId, ENDPOINT])

    //once the room set.
    //useEffect will hit the socket and try to join the room. 
    useEffect(() => {
        if (room !== null) {
            socket = io(ENDPOINT);
            //now we can emit events from a socket.
            //change to dynamic room #, which you ask for in Chat component.
            //    socket.emit('join', ({ name: userInfo.user, userId: userId, room: `${room}-Room-1` }))

            socket.emit('join', ({ name: userInfo.user, userId: userId, room: `${room}-Room-1` }))
            //after joining a room... need to get all messages for that room.
            //if this useEffect hits, it means he is joining a room.
            //since we are only showing the rooms he is allowed to join, we don't need to check for this authorization.
            socket.on('room-message-history', (messageHistoryForRoom) => {
                dispatch(requestChats())
                if (messageHistoryForRoom) {
                    dispatch(retrieveChats(messageHistoryForRoom))
                }
                else {
                    dispatch(retrieveChatsError())
                }
            })


            //useEffect cleanup.
            return () => {
                //this will occur when leaving the chat.
                let leaveRoomData = {
                    room: `${room}-Room-1`,
                    userId: userId,
                    name: userInfo.user
                }
                //leaeve the room.
                socket.emit('leaveRoom', (leaveRoomData), () => {
                    setLeaveRoomMessage(message)
                    dispatch(leaveRoom(leaveRoomData))
                })
            }
        }
        //once you get the room
        //or the value of the room changes. then a refetch occurs.
    }, [room])


    useEffect(() => {
        socket = io(ENDPOINT);
        //now we can emit events from a socket.
        socket.on('chat-message', (message) => {
            dispatch(addMessage(message))
        })

        socket.on('users-join-leave', (message) => {
            setMessages([message.message])
        })

    }, [])


    const handleSubmit = (e) => {

        console.log('inside handle submit')
        e.preventDefault();
        if (message) {
            //dispatch action to add the message.
            let data = {
                message: message,
                room: `${room}-Room-1`,
                userId: userId,
                sender: userInfo.user,
                timeStamp: new Date(),
            }
            socket.emit('sendMessage', (data), () =>
                setMessage('')
            )
        }
    }

    const handleLeaveRoom = (e) => {
        e.preventDefault();
        let leaveRoomData = {
            room: `${room}-Room-1`,
            userId: userId,
            name: userInfo.user
        }
        dispatch(leaveRoom(leaveRoomData))
        socket.emit('leaveRoom', (leaveRoomData), () => {
            setLeaveRoomMessage(message)

        })

    }


    //useEffect that will get all messages related to that room.
    useEffect(() => {
        if (userChats.status === 'retrieved' && room !== null) {

            let currentRoom = userChats.rooms.find(eachRoom => {
                if (eachRoom._id === `${room}-Room-1`) {
                    console.log(room, 'THIS IS ROOM.')
                    return room;
                }
            })
            if (currentRoom.messages) {
                setAllMessages(currentRoom.messages)
            }

        }
    }, [userChats])

    console.log(allMessages, 'ALL MESSAGES')

    return <ChatWrapper>
        <div>
            <StyledTitle>Welcome to the chat!</StyledTitle>
            {messages !== null && messages.length > 0 &&
                <div>
                    {messages.map(message => {
                        //CHANGE KEY
                        return <div >
                            {message}
                        </div>
                    })}
                </div>
            }

            {/* ALL MESSAGES FROM THE FRONT END. */}

            {
                allMessages !== null && <ChatBox>
                    {allMessages.map(message => {
                        //CHANGE KEY
                        return <div >
                            {message.sender} - {message.message}
                        </div>
                    })}
                </ChatBox>
            }

            <StyledForm onSubmit={handleSubmit}>
                <input placeholder="message" type="text" onChange={(e) => setMessage(e.target.value)}></input>
                <button type='submit'>send</button>
                <Link to={`/chat?name=${name}`}></Link>
                <button onClick={handleLeaveRoom}>Leave Room</button>
            </StyledForm>
        </div>
    </ChatWrapper>
}

export default ChatJoin;


const StyledForm = styled.form`
`
const StyledTitle = styled.h1`
    font-size: 3rem;
    text-align: center;
    border-bottom: solid black 2px;
    width: 40%;
    margin: 0 auto;

`

const ChatBox = styled.div`
width: 30rem;
height: 30rem;
overflow: scroll;

`

const ChatWrapper = styled.div`
display: flex;
justify-content: center;
`