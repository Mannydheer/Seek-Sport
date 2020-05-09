import React, { useState, useEffect, useRef } from 'react';
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
import ClipLoader from "react-spinners/ClipLoader";
import ReactEmoji from 'react-emoji';



let socket;
let ENDPOINT = 'localhost:4000';


const ChatJoin = () => {
    //initialize SOCKET ENDPOINT.
    socket = io(ENDPOINT);
    let eventId = useParams().eventId;
    let groupName = useParams().groupName;
    const scrollRef = useRef(null);
    const dispatch = useDispatch();
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
    //---------------------USE-EFFECTS.------------------
    //--------------FETCH ALL PARTICIPANTS OF THAT ROOM...---------------
    useEffect(() => {
        if (eventId) {
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
                        dispatch(actualChatParticipants(userObject))
                        dispatch(selectedRoom(`${eventId}-Room-1`))
                    }
                }
                catch (err) {
                    console.log(err, 'error occured inside catch for handler user events.')
                }
            }
            handleGetChatRoom();
        }
    }, [eventId])
    //--------------JOIN A ROOM...---------------
    //first time someone join... they will not be an existing user...
    //so the BE and FE both get updated with the participant and room data.
    useEffect(() => {
        if (eventId) {
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
        }
    }, [eventId, ENDPOINT])
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
    //--------------GET ALL MESSAGES FOR THE ROOM.---------------
    useEffect(() => {
        if (userChats.status === 'retrieved' && eventId !== null) {
            let currentRoom = userChats.rooms.find(eachRoom => {
                if (eachRoom._id === `${eventId}-Room-1`) {
                    setAllMessages(eachRoom.messages)
                }
            })
        }
    }, [userChats, allMessages])
    //--------------ENTER KEYPRESS AND SEDN MESSAGE..---------------
    useEffect(() => {
        window.addEventListener("keydown", handleKeypress)
        //need to remove event listnner.
        return () => window.removeEventListener("keydown", handleKeypress);
    }, [message])
    //---------------------FUNCTIONS------------------
    const handleKeypress = (e) => {
        if (e.keyCode === 13) {
            handleSubmit(e)
        }
    }
    //--------------SUBMIT A MESAGE---------------
    const handleSubmit = (e) => {
        console.log('inside handle submit')
        console.log('enter', message)
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
    //--------------SCROLL TO BOTTOM---------------
    useEffect(() => {
        if (allMessages && userChats.actualParticipants) {
            //block end...
            //take scroll right at the end....
            scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    });

    return <MainWrapper>

        <GroupNameWrapper>
            {groupName ? <GroupName>{groupName}
            </GroupName> :
                <GroupName>Chat Room</GroupName>
            }
        </GroupNameWrapper>
        <ChatWrapper >
            {/* ALL MESSAGES FROM THE FRONT END. */}
            {
                allMessages && userChats.actualParticipants && <ChatBox>
                    {allMessages.map(message => {
                        //CHANGE KEY
                        return <div>
                            {message.sender === userInfo.user ?
                                <SenderText>
                                    <div>
                                        <SenderMessage>{ReactEmoji.emojify(message.message)}</SenderMessage>
                                        <TimeWrapper>{dateConverter(message.timeStamp)}</TimeWrapper>
                                    </div>
                                    {userChats.actualParticipants[message.userId] ? <Image src={`/${userChats.actualParticipants[message.userId].profileImage}`} />
                                        :
                                        <ClipLoader size={50} color={"white"} />}
                                </SenderText>
                                :
                                <ReceiverText>
                                    {userChats.actualParticipants[message.userId] ? <Image src={`/${userChats.actualParticipants[message.userId].profileImage}`} />
                                        :
                                        <ClipLoader size={50} color={"white"} />}
                                    <div>
                                        <ReceiverMessage>{ReactEmoji.emojify(message.message)}</ReceiverMessage>

                                        <ReceiveTimeWrapper>{dateConverter(message.timeStamp)}</ReceiveTimeWrapper>
                                    </div>
                                </ReceiverText>
                            }
                        </div>

                    })}
                    <div ref={scrollRef}></div>
                </ChatBox>
            }
        </ChatWrapper>
        <StyledForm>
            <Send>
                <textarea
                    cols="33"
                    value={message}
                    placeholder="Type your message..." type="text" onChange={(e) => setMessage(e.target.value)}>
                </textarea>
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
`
const TimeWrapper = styled.div`
margin: 8px 1.1rem;
color: white;
text-align: right;
font-size: 0.8rem;
`
const ReceiveTimeWrapper = styled.div`
margin: 8px 1.1rem;
color: white;
text-align: left;
font-size: 0.8rem;
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
width: 100%;
position: relative;
bottom: 0;
textarea {
    width: 100%;
    height: 5rem;
    resize: none;
    background-image: linear-gradient(-20deg, #2b5876 0%, #4e4376 100%);
    border-radius: 0 0 25px 25px;
    outline: none;
    border: solid white 1px;
    font-size:1rem;
    padding-bottom: 5px;
    color: white;
    font-family: 'Comfortaa', cursive;
}
`
const StyledSendButton = styled(IoMdSend)`
background-image: linear-gradient(-20deg, #2b5876 0%, #4e4376 100%);
width: 3rem;
height: 5rem;
border-radius: 0 0px 25px 0;
border-top: white solid 1px;
border-left: white solid 1px;
cursor: pointer;
color: white;
position: absolute;
right: 0;
`
const Send = styled.div`
display: flex;
`
const ChatBox = styled.div`
width: 100%;
`
const ChatWrapper = styled.div`
position: relative;
background-color: rgba(0,0,0,0.4) !important;
width: 100%;
height: 33.5rem;
overflow-y: scroll;
scroll-behavior: smooth;
@media screen and (max-width: 768px) {
width: 100%;
height: 20rem                    
 }
 @media screen and (max-width: 420px) {
width: 100%;
height: 10rem                    
 }
`
const MainWrapper = styled.div`
width: 100%;
opacity: 0.9;
margin-left: 1.1rem;
margin-top: 2rem;
margin-right: 1.1rem;
`
const GroupName = styled.h1`
border-bottom: solid 2px white;
width: 95%;
margin: 0 auto;
`
const GroupNameWrapper = styled.div`
text-align: center;
height: 7%;
background-color: rgba(0,0,0,0.4) !important;
border-radius: 25px 25px 0 0;
color: white;
width: 100%;
`