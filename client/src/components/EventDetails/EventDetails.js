import React, { useState, useEffect } from 'react'
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import Join from '../Join';
import Leave from '../Leave';
import Cancel from '../Cancel';
import { useLocation } from 'react-router-dom';

const EventDetails = ({ index, event, canceled, setCanceled }) => {
    const userInfo = useSelector(state => state.userReducer)
    const parkInfo = useSelector(state => state.parkReducer)
    //set state for the participants of that current event.
    const [currentEventParticipants, setCurrentEventParticipants] = useState(null)
    let location = useLocation().pathname;
    const [joined, setJoined] = useState(false)

    useEffect(() => {
        const handleCurrentEventParticipants = async () => {
            let token = localStorage.getItem('accesstoken')
            try {
                let response = await fetch(`/currentEventParticipants/${event.participantId}`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'Authorization': `${token}`
                    },
                })
                if (response.status === 200) {
                    let participantResponse = await response.json();
                    setCurrentEventParticipants(participantResponse.eventParticipants)
                    participantResponse.eventParticipants.find(participant => {
                        if (participant.userId === userInfo._id) {
                            setJoined(true)
                        }
                    })
                }
            }
            catch (err) {
                console.log(err, 'error occured inside catch for handler user events.')
            }
        }
        handleCurrentEventParticipants();
    }, [joined])

    //function called from render to show all images.
    const getParticipantImages = (currentEventParticipants) => {
        return currentEventParticipants.map(participant => {
            return <div key={`${participant.profileImage}`}>
                <StyledImage key={participant.profileImage} src={participant.profileImage}></StyledImage>
                <div style={{ textAlign: 'center' }}>{participant.name}</div>
            </div>

        })
    }
    return (
        <Wrapper key={event._id}>
            {typeof index === "number" && <Number>0{index + 1}.</Number>}
            <MainText >
                <h1>Host: {event.name}</h1>
                <h2>Sport: {event.sport}</h2>
                <h2>Skill: {event.skill}</h2>
                <h2>Time: {event.readTime}</h2>
                <h2>Date: {event.bookedDate}</h2>
                <h2>Duration: {event.duration} hr</h2>
                {parkInfo.parks !== null &&
                    parkInfo.parks.map(park => {
                        if (park.id === event.parkId) {
                            return <div key={`${park.id}${park.formatted_address}`}>
                                <h2>Address: {park.formatted_address}</h2>
                                <h2>Park name: {park.name}</h2>
                            </div>
                        }
                    })
                }
            </MainText>
            {location !== '/userEvents' ? <JoinLeave>
                {userInfo._id !== event.userId && <Join setJoined={setJoined} joined={joined} event={event} />}
                {userInfo._id !== event.userId && <Leave setJoined={setJoined} joined={joined} event={event} />}
                {userInfo._id === event.userId && <Cancel canceled={canceled} setCanceled={setCanceled} event={event} />}
            </JoinLeave> : userInfo._id === event.userId && <JoinLeave><Cancel canceled={canceled} setCanceled={setCanceled} event={event} /></JoinLeave>}
            {/* IMAGES. */}
            <ParticipantText>
                <Participants>Participants</Participants>
                {currentEventParticipants !== null && <Images>
                    {getParticipantImages(currentEventParticipants)}
                </Images>}
            </ParticipantText>
        </Wrapper >
    )
}

export default EventDetails;
const Wrapper = styled.div`
display: flex;
width: 80%;
margin: 0 auto;
border-bottom: 2px solid black;
font-size: 14px;
margin-top: 0.5rem;
@media screen and (max-width: 768px) {
display: block;
text-align: center;
width: 100%;
}
`
const JoinLeave = styled.div`
display: flex;
flex-direction: column;
justify-content: center;
align-content: center;
margin-right: 2rem;
`
const StyledImage = styled.img`
width: 150px;
height: 150px;
border-radius: 50%;
margin-top: 20px;
@media screen and (max-width: 420px) {
width: 100px;
height: 100px;
}
`
const Images = styled.div`
display: flex;
justify-content: space-evenly;
flex-flow: row wrap;
@media screen and (max-width: 420px) {
display: block;
}
`
const ParticipantText = styled.div`
width: 100%;
`

const MainText = styled.div`
h2 {
    width: 300px;
    line-height: 1.5;
}
h1 {
    font-weight: 900;
    width: 300px;
    line-height: 2;
}
@media screen and (max-width: 768px) {
h1, h2 {width: 100%;}
}
`
const Participants = styled.div`
font-weight: 900;
line-height: 2;
text-align: center;
border-radius: 25px;
padding: 5px;
border: solid 1px black;    
`
const Number = styled.div`
font-weight: 600;
font-size: 4rem;
margin-right: 2rem;
color: #FF4136;
opacity: 0.7;
@media screen and (max-width: 420px) {
font-size: 3rem;
}
`