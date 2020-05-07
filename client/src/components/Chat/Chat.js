import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { requestRegisteredUserEvents, retrieveRegisteredUserEvents, retrieveRegisteredUserEventsError } from '../actions/userActions';

import ChatJoin from '../ChatJoin';
import Rooms from '../Rooms';
import styled from 'styled-components';

const Chat = () => {
    //pseudocode.
    //most likely, by when joined within an event.
    //a chat button will appear... which will open a modal...
    //since we are on the page.. we have access to the participant ID of that event...
    //we will use this as the rooms for each chat.
    //so ... when clicking on the button, you will now be inside the chat...
    //redirect to chat messaging component..

    const userInfo = useSelector(state => state.userReducer);
    const userRegisteredEvents = useSelector(state => state.userRegisteredReducer)
    const actualChatParticipants = useSelector(state => state.chatReducer.actualParticipants)
    const chatInfo = useSelector(state => state.chatReducer)



    // const [eventInfo, setEventInfo] = useState(null);


    //on mount of this chat component...
    //we will get all events that the current user is registered for.

    const dispatch = useDispatch();

    useEffect(() => {

        let userId = userInfo._id;


        const handleUserRegisteredEvents = async () => {
            dispatch(requestRegisteredUserEvents())
            try {
                let response = await fetch(`/userRegisteredEvents/${userId}`);
                let userResponse = await response.json()
                console.log(userResponse)
                if (userResponse.status === 200) {
                    dispatch(retrieveRegisteredUserEvents(
                        userResponse.eventInfo
                    ))
                }
                else {
                    dispatch(retrieveRegisteredUserEventsError())
                }
            } catch (err) {
                console.log(err)
            }
        }
        handleUserRegisteredEvents()
    }, [])
    //we have the user Id.

    const checkOnlineParticipant = (id) => {
        //first we find the room from the chat participants
        //use actualChatParticipants.room


        if (chatInfo.status === "retrieved" && chatInfo.selectedRoom) {



            let currentRoom = chatInfo.rooms.find(room => {
                if (room._id === chatInfo.selectedRoom) {
                    return room;
                }
            })
            if (currentRoom) {
                let activeParticipant = currentRoom.chatParticipants.find(participant => {
                    if (participant.userId === id) {
                        return participant;
                    }
                })
                if (activeParticipant) {
                    return <StyledActive />
                }
                else {
                    return <StyledInactive />

                }

            }

        }
    }

    return <Wrapper >

        {/* ------------------------------MAP THROUGH ALL EVENTS(ROOMS).-------------------------- */}
        {userRegisteredEvents.status !== "retrieved..." ? <div>Seems like you havn't registered for any events!</div> :
            // each of these each represents each chat.
            userRegisteredEvents.registeredEvents.map(event => {
                return <Link to={`/chatJoin/${event._id}`} key={event._id}>
                    <Rooms event={event}></Rooms>
                </Link>
            })

        }

        {/* ------------------------------GETTING PARTICIPANTS CURRENTLY INSIDE CHAT ROOM.-------------------------- */}
        {actualChatParticipants && chatInfo.status === "retrieved" && <div>
            {Object.values(actualChatParticipants).map(participant => {
                return <div style={{ position: 'relative', display: 'flex' }}>
                    {checkOnlineParticipant(participant.userId)}
                    <Image src={`/${participant.profileImage}`} />
                    <Name>{participant.name}</Name>

                </div>
            })}
        </div>
        }




    </Wrapper>
}

export default Chat;

const Wrapper = styled.div`
padding: 0 5rem;
background-color: rgb(82,97,144);
margin-right: 1.2rem;
opacity: 0.9;
a {
    text-decoration: none;
    color: black;
    border-radius: 10px;
}

border-radius: 25px;
`


const Image = styled.img`
width: 50px;
height: 50px;
border-radius: 50%;
margin:0 10px;
border: solid 2.5px white;
position: relative;
`
const StyledActive = styled.div`
width: 15px;
height: 15px;
background-color: green;
position: absolute;
border-radius: 50%;
border: solid 1px white;
z-index: 1000;
`
const StyledInactive = styled.div`
width: 15px;
height: 15px;
background-color: red;
position: absolute;
border-radius: 50%;
border: solid 1px white;
z-index: 1000;
`
const Name = styled.div`
margin-top: 10px;
color: white;
font-size: 1.1rem

`








