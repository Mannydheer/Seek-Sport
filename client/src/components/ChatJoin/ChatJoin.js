import React, { useState, useEffect } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import io from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import {
    requestChats,
    retrieveChats, retrieveChatsError,
    addMessage, leaveRoom
} from '../actions/userActions';

import { IoMdSend } from 'react-icons/io';






let socket;
let ENDPOINT = 'localhost:4000';
socket = io(ENDPOINT);


const ChatJoin = () => {



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
                //also redirect to room page.

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
    }, [eventId, userChats])


    //--------------SOCKET WILL LISTEN FOR CHAT-MESSAGE---------------
    useEffect(() => {
        socket.on('chat-message', (message) => {
            console.log(message, 'INSIDE CHAT-MESSAGE BEFORE DISPATCH')
            dispatch(addMessage(message))
        })
    }, [])

    //--------------JOIN OR LEAVE GROUP MESSAGE!---------------
    useEffect(() => {

        socket.on('users-join-leave', (message) => {
            console.log(message, 'message inside join or leave')
            setMessages(message.message)
        })
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




    return <MainWrapper>
        {/* <button onClick={handleLeaveRoom}>Leave Room</button> */}

        <ChatWrapper>
            <h2>{messages}</h2>

            {/* ALL MESSAGES FROM THE FRONT END. */}
            {
                allMessages && <ChatBox>
                    {allMessages.map(message => {
                        //CHANGE KEY
                        return <div>
                            {message.sender === userInfo.user ?
                                <SenderText>
                                    <SenderMessage>
                                        {message.message}
                                    </SenderMessage>
                                    <div>
                                        {message.sender}
                                    </div>


                                </SenderText>
                                :
                                <ReceiverText>

                                    <div>
                                        {message.sender}
                                    </div>
                                    <ReceiverMessage>
                                        {message.message}
                                    </ReceiverMessage>

                                </ReceiverText>

                            }
                        </div>
                    })}
                </ChatBox>
            }

        </ChatWrapper>
        <StyledForm>
            <Send>
                <textarea placeholder="message" type="text" onChange={(e) => setMessage(e.target.value)}></textarea>
                <StyledSendButton onClick={handleSubmit}></StyledSendButton>
            </Send>
            <Link to={`/chat?name=${name}`}></Link>
        </StyledForm>
    </MainWrapper>
}

export default ChatJoin;

const SenderText = styled.div`
display: flex;
justify-content: flex-end;
margin: 0 1.2rem;
/* text-align: right; */


`
const ReceiverText = styled.div`
display: flex;
justify-content: flex-start;
text-align: left;
margin: 0 1.2rem;
`
const ReceiverMessage = styled.div`
background-color: rgb(130,204,221);
border-radius: 25px;
padding: 10px;

`
const SenderMessage = styled.div`
background-color: rgb(120,224,143);
border-radius: 25px;
padding: 10px;
`

const StyledForm = styled.form`
height: 5%;
width: 100%;



textarea {
    width: 100%;
    resize: none;
    background-image: linear-gradient(-20deg, #2b5876 0%, #4e4376 100%);
    color: white;
    height: 10%;
}

`
const StyledSendButton = styled(IoMdSend)`
background-image: linear-gradient(-20deg, #2b5876 0%, #4e4376 100%);
cursor: pointer;
width: 2rem;
height: 2rem;
color: white;

`

const Send = styled.div`
display: flex;

button {
    border-radius: 25px;
    color: black;
    background-color: red;
    
}
input {
    width: 100%;

}
`




const ChatBox = styled.div`

`

const ChatWrapper = styled.div`
background-color: rgb(82,97,144);
position: relative;

width: 100%;
height: 95%;
overflow-y: scroll;
scroll-behavior: smooth;


/* display: flex;
justify-content: center; */
`


const MainWrapper = styled.div`
height: 100%;
width: 100%;


`
