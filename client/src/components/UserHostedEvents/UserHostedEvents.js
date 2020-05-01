import React, { useState, useEffect } from 'react'
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { selectPark, requestHosts, retrieveHosts, retrieveHostsError } from '../actions/parkActions';
import EventDetails from '../EventDetails';


const UserHostedEvents = () => {

    const userInfo = useSelector(state => state.userReducer)

    const [events, setEvents] = useState(null)
    const [participants, setParticipants] = useState(null)
    const [error, setError] = useState(false)
    const [canceled, setCanceled] = useState(false)


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
            {events !== null && participants !== null && events.map(event => {
                return (
                    <EventDetails canceled={canceled} setCanceled={setCanceled} event={event} />
                )
            })}
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
`
