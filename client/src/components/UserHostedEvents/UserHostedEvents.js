import React, { useState, useEffect } from 'react'
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { selectPark, requestHosts, retrieveHosts, retrieveHostsError } from '../actions/parkActions';
import EventDetails from '../EventDetails';
import ClipLoader from "react-spinners/ClipLoader";
import { css } from "@emotion/core";




const UserHostedEvents = () => {

    const userInfo = useSelector(state => state.userReducer)

    const [events, setEvents] = useState(null)
    const [participants, setParticipants] = useState(null)
    const [error, setError] = useState(false)
    const [canceled, setCanceled] = useState(false)

    const override = css`
    display: block;
     margin: 0 auto;
   `;


    useEffect(() => {

        const handleUserEvents = async () => {
            let token = localStorage.getItem('accesstoken')
            //will get all events related to the user.
            try {
                let response = await fetch(`/userEvents/${userInfo._id}`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'Authorization': `${token}`
                    }
                })
                if (response.status === 200) {
                    let userEvents = await response.json();
                    console.log(userEvents.events, 'inside userhostedvenet')
                    setEvents(userEvents.events)
                    setParticipants(userEvents.participants)
                    //setCanceled will be turned to true if a cancel occurs. 
                    //this will cause useEffect to refetch event data.
                    setCanceled(false)
                }
                else {
                    setError(true)
                }
            }
            catch (err) {
                console.log(err, 'error occured inside catch for handler user events.')
                setError(true)
            }
        }
        handleUserEvents();
    }, [canceled, setCanceled])


    return (
        <Wrapper>
            <Title>Hosted Events.
            <TitleText>See details for all the events you are hosting.</TitleText>
            </Title>


            {events !== null ? participants !== null && events.map((event, index) => {
                return (
                    <EventDetails index={index} canceled={canceled} setCanceled={setCanceled} event={event} />
                )
            }) : <ClipLoader
                    css={override}
                    size={150} color={"black"} />
            }
            {error && <div>Error occured on the page.</div>}
        </Wrapper>
    )
}

export default UserHostedEvents;


const Wrapper = styled.div`
   display: grid;
    /* grid-template-columns: repeat(auto-fill, minmax(150px, 310px)); */
    grid-template-rows: repeat(auto-fit, minmax(100px, 1fr) );
    grid-column-gap: 10px;
    grid-row-gap: 10px;
    width: 90%;
    margin: 0 auto;

`

const Title = styled.div`
width: 90%;
     font-weight: 900;
    margin: 0 auto;
    font-size: 3rem;
    border-bottom: black solid 2px;


`
const TitleText = styled.div`

    font-size: 1.4rem;
    font-weight: 100;
    

`
