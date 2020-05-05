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
let ENDPOINT = 'localhost:4000';
socket = io(ENDPOINT);



const ChatJoin = ({ }) => {






    //now we have the eventId of which we want to join the chat
    //we have access to the participant ID which will be the room.
    let eventId = useParams().eventId;



    const dispatch = useDispatch();


    //GET ROOM HISTORY FUNCTION.
    const getRoomHistory = () => {

        socket.on('room-message-history', (messageHistoryForRoom) => {
            dispatch(requestChats())
            if (messageHistoryForRoom) {
                dispatch(retrieveChats(messageHistoryForRoom))
            }
            else {
                dispatch(retrieveChatsError())
            }
        })

    }



    //----------------------SELECTORS------------------
    const userInfo = useSelector(state => state.userReducer);
    const userChats = useSelector(state => state.chatReducer)

    let userId = userInfo._id;

    //----------------------USE-STATES------------------
    const [name, setName] = useState('');
    const [messages, setMessages] = useState('')
    const [message, setMessage] = useState(null)
    const [leaveRoomMessage, setLeaveRoomMessage] = useState(null)
    const [allMessages, setAllMessages] = useState(null);



    //---------------------USE-EFFECTS.------------------
    useEffect(() => {
        socket.emit('join', { name: userInfo.user, userId: userId, room: `${eventId}-Room-1` }, (message) => {
            if (message === "Existing User") {
                socket.on('room-message-history', (messageHistoryForRoom) => {
                    dispatch(requestChats())
                    if (messageHistoryForRoom) {
                        dispatch(retrieveChats(messageHistoryForRoom))
                    }
                    else {
                        dispatch(retrieveChatsError())
                    }
                })
            }
        })
        //useEffect cleanup. - DISCONNECT EVENT.
        return () => {
            //this will occur when leaving the chat.
            let leaveRoomData = {
                room: `${eventId}-Room-1`,
                userId: userId,
                name: userInfo.user
            }
            //leaeve the room.
            socket.emit('leaveRoom', (leaveRoomData), () => {
                setLeaveRoomMessage(message)
                dispatch(leaveRoom(leaveRoomData))
            })
            socket.off();
        }
    }, [eventId, ENDPOINT])

    //--------------GET ALL ROOM MESSAGE HISTORY.---------------

    useEffect(() => {
        socket.on('room-message-history', (messageHistoryForRoom) => {
            dispatch(requestChats())
            if (messageHistoryForRoom) {
                dispatch(retrieveChats(messageHistoryForRoom))
            }
            else {
                dispatch(retrieveChatsError())
            }
        })
        // return () => {
        //     socket.off();
        //     socket.removeAllListeners();
        // }

    }, [eventId, userChats])


    //--------------SOCKET WILL LISTEN FOR CHAT-MESSAGE---------------
    useEffect(() => {


        socket.on('chat-message', (message) => {
            console.log(message, 'INSIDE CHAT-MESSAGE BEFORE DISPATCH')
            dispatch(addMessage(message))
        })
        // return () => {
        //     socket.off()
        //     socket.removeAllListeners();

        // }

        //every time the reducer changes.
    }, [])

    //--------------JOIN OR LEAVE GROUP MESSAGE!---------------
    useEffect(() => {

        socket.on('users-join-leave', (message) => {
            console.log(message, 'message inside join or leave')
            setMessages(message.message)
        })
        // return () => {
        //     socket.off();
        //     socket.removeAllListeners();

        // }

    }, [message])



    //--------------SUBMIT A MESAGE---------------

    const handleSubmit = (e) => {
        console.log('inside handle submit')
        e.preventDefault();
        if (message) {
            //dispatch action to add the message.
            let data = {
                message: message,
                room: `${eventId}-Room-1`,
                userId: userId,
                sender: userInfo.user,
                timeStamp: new Date(),
            }
            dispatch(addMessage(data))

            socket.emit('sendMessage', (data), () =>
                setMessage('')

            )
        }
    }

    //--------------LEAVE ROOM---------------
    const handleLeaveRoom = (e) => {
        e.preventDefault();
        let leaveRoomData = {
            room: `${eventId}-Room-1`,
            userId: userId,
            name: userInfo.user
        }
        dispatch(leaveRoom(leaveRoomData))
        socket.emit('leaveRoom', (leaveRoomData), () => {
            setLeaveRoomMessage(message)
        })
    }


    //--------------GET ALL MESSAGES FOR THE ROOM.---------------
    useEffect(() => {
        if (userChats.status === 'retrieved' && eventId !== null) {
            console.log('inside useffect*******')
            let currentRoom = userChats.rooms.find(eachRoom => {
                if (eachRoom._id === `${eventId}-Room-1`) {
                    console.log(eventId, 'THIS IS ROOM.')
                    setAllMessages(eachRoom.messages)
                }
            })
            // if (!currentRoom.messages) {
            //     setAllMessages(currentRoom.messages)
            // }

        }
    }, [userChats, allMessages])

    console.log(allMessages, 'ALL MESSAGES')




    return <ChatWrapper>
        <div>
            <StyledTitle>Welcome to the chat!</StyledTitle>
            <h2>{messages}</h2>

            {/* ALL MESSAGES FROM THE FRONT END. */}
            {
                allMessages && <ChatBox>
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
width: 300px;
height: 300px;
overflow-y: scroll;

`
const StyledTitle = styled.h1`
    font-size: 1.1rem;
    text-align: center;
    border-bottom: solid black 2px;
    width: 30%;
    margin: 0 auto;

`

const ChatBox = styled.div`

`

const ChatWrapper = styled.div`
/* display: flex;
justify-content: center; */
`