import React, { useState, useEffect } from 'react'
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { selectPark, requestHosts, retrieveHosts, retrieveHostsError } from '../actions/parkActions';
import EventDetails from '../EventDetails';


const UserHostedEvents = () => {

    const userInfo = useSelector(state => state.userReducer)

    const [events, setEvents] = useState(null)
    const [error, setError] = useState(false)

    console.log(userInfo._id)

    useEffect(() => {

        const handleUserEvents = async () => {


            let token = localStorage.getItem('accesstoken')
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
                    setEvents(userEvents.events)
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

    }, [])

    return (
        <Wrapper>

            {events !== null && events.map(event => {
                return (
                    <EventDetails event={event}></EventDetails>
                )
            })}


            {error && <div>Error occured on the page.</div>}



        </Wrapper>
    )


}

export default UserHostedEvents;


const Wrapper = styled.div`
display: flex;
justify-content: space-around;
height: 100vh;
margin-top: 5rem;


`
