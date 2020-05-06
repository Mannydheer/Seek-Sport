import React, { useState, useEffect } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import io from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import {
    requestChats,
    retrieveChats, retrieveChatsError,
    addMessage, leaveRoom, actualChatParticipants, addChatParticipants, selectedRoom
} from '../actions/userActions';

import { IoMdSend } from 'react-icons/io';






let socket;
let ENDPOINT = 'localhost:4000';


const ChatJoin = () => {
    socket = io(ENDPOINT);
    //
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

    const dateConverter = (timeData) => {
        let d = new Date(timeData);

        let todayDate = new Date().toLocaleDateString().split('/')[1]
        let messageDate = d.toLocaleDateString().split('/')[1]

        let removeSecondsTime = d.toLocaleTimeString().split(':')
        let AMPM = removeSecondsTime[2].split(' ')[1]
        let time = removeSecondsTime.splice(0, 2).join(':')
        let finalTime;
        if (todayDate === messageDate) {
            finalTime = time + ', ' + AMPM + ', ' + "Today"
        }
        else {
            finalTime = time + ', ' + AMPM
        }

        return finalTime;

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
    // const [chatMembers, setChatMembers] = useState(null)


    //---------------------FUNCTIONS------------------
    const handleKeypress = (e) => {
        if (e.keyCode === 13) {
            handleSubmit(e)
        }

    }

    //---------------------USE-EFFECTS.------------------

    //--------------ENTER KEYPRESS AND SEDN MESSAGE..---------------
    useEffect(() => {
        window.addEventListener("keydown", handleKeypress)

        return () => window.addEventListener("keydown", handleKeypress);

    }, [])

    //--------------FETCH ALL PARTICIPANTS OF THAT ROOM...---------------

    useEffect(() => {
        const handleGetChatRoom = async () => {
            let token = localStorage.getItem('accesstoken')
            try {
                let response = await fetch(`/getChatRoom/${eventId}`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'Authorization': `${token}`
                    },
                })
                if (response.status === 200) {
                    let participantResponse = await response.json();
                    let userObject = {}

                    participantResponse.eventParticipants.forEach(user => {
                        userObject[user.userId] = user;
                    })
                    //also keep track of which room the participants are from.
                    // setChatMembers(userObject)
                    dispatch(actualChatParticipants(userObject))
                    dispatch(selectedRoom(`${eventId}-Room-1`))
                }
            }
            catch (err) {
                console.log(err, 'error occured inside catch for handler user events.')
            }
        }
        handleGetChatRoom();
    }, [eventId])




    //--------------JOIN A ROOM...---------------
    //first time someone join... they will not be an existing user...
    //so the BE and FE both get updated with the participant and room data.
    //


    useEffect(() => {
        socket.emit('join', { name: userInfo.user, userId: userId, room: `${eventId}-Room-1` }, (messageInfo) => {
            console.log('component MOUNT', messageInfo)
            if (messageInfo.existingUser) {
                dispatch(addChatParticipants(messageInfo))
            }
            else if
                (messageInfo.joined) {

                console.log('successful join')
                dispatch(requestChats())
                if (messageInfo.roomData) {
                    dispatch(retrieveChats(messageInfo))
                }
                else {
                    dispatch(retrieveChatsError())
                }
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
            socket.emit('leaveRoom', (leaveRoomData), (data) => {
                console.log('COMPONENT UNMOUNT')
                setLeaveRoomMessage(message)
                dispatch(leaveRoom(data))
                //also redirect to room page.
            })
            socket.off();
        }
    }, [eventId, ENDPOINT])

    //--------------GET ALL ROOM MESSAGE HISTORY.---------------

    // useEffect(() => {
    //     socket.on('room-message-history', (messageHistoryForRoom) => {
    //         dispatch(requestChats())
    //         if (messageHistoryForRoom) {
    //             dispatch(retrieveChats(messageHistoryForRoom))
    //         }
    //         else {
    //             dispatch(retrieveChatsError())
    //         }
    //     })
    // }, [eventId, userChats])


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
            dispatch(addChatParticipants(message))
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
            // dispatch(addMessage(data))
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
            let currentRoom = userChats.rooms.find(eachRoom => {
                if (eachRoom._id === `${eventId}-Room-1`) {
                    setAllMessages(eachRoom.messages)
                }
            })
            // if (!currentRoom.messages) {
            //     setAllMessages(currentRoom.messages)
            // }

        }
    }, [userChats, allMessages])





    return <MainWrapper>
        {/* <button onClick={handleLeaveRoom}>Leave Room</button> */}

        <ChatWrapper>

            {/* ALL MESSAGES FROM THE FRONT END. */}
            {
                allMessages && userChats.actualParticipants && <ChatBox>
                    {allMessages.map(message => {
                        //CHANGE KEY
                        return <div>
                            {message.sender === userInfo.user ?
                                <div>
                                    <SenderText>
                                        <div>
                                            <SenderMessage>{message.message}</SenderMessage>
                                            <TimeWrapper>{dateConverter(message.timeStamp)}</TimeWrapper>
                                        </div>
                                        {userChats.actualParticipants[message.userId] ? <Image src={`/${userChats.actualParticipants[message.userId].profileImage}`} /> : <div>LOADING</div>}
                                    </SenderText>

                                </div>
                                :
                                <ReceiverText>
                                    {/* THIS ONE */}

                                    {userChats.actualParticipants[message.userId] ? <Image src={`/${userChats.actualParticipants[message.userId].profileImage}`} /> : <div>LOADING</div>}
                                    <div>
                                        <ReceiverMessage>{message.message}</ReceiverMessage>
                                        <ReceiveTimeWrapper>{dateConverter(message.timeStamp)}</ReceiveTimeWrapper>
                                    </div>
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
margin: 0 1.1rem;
/* text-align: right; */
`
const TimeWrapper = styled.div`
margin: 8px 1.1rem;
color: white;
text-align: right;
font-size: 0.8rem;
/* text-align: right; */
`
const ReceiveTimeWrapper = styled.div`
margin: 8px 1.1rem;
color: white;
text-align: left;
font-size: 0.8rem;
/* text-align: right; */
`

const Image = styled.img`
width: 50px;
height: 50px;
border-radius: 50%;
margin:0 10px;
border: solid 2.5px white;
`
const ReceiverText = styled.div`
display: flex;
justify-content: flex-start;
text-align: left;
margin: 0 1.1rem;
`
const ReceiverMessage = styled.div`
background-color: rgb(130,204,221);
border-radius: 25px;
padding: 7px;

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
    height: 2rem;
    resize: none;
    background-image: linear-gradient(-20deg, #2b5876 0%, #4e4376 100%);
    color: white;
  
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
position: relative;
background-color: rgb(82,97,144);


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
