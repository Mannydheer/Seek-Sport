import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import EventDetails from '../EventDetails';



const UserActivities = () => {

    const userLoggedIn = useSelector(state => state.userReducer)
    const [allEvents, setAllEvents] = useState(null)
    const [canceled, setCanceled] = useState(false)
    const [message, setMessage] = useState(null)





    useEffect(() => {
        //on mount will get all the events that the current user has signed up for.
        const handleUserActivities = async () => {
            let token = localStorage.getItem('accesstoken')
            try {
                let response = await fetch(`/userActivities/${userLoggedIn._id}`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'Authorization': `${token}`
                    },
                })
                let eventResponse = await response.json();

                if (eventResponse.status === 200) {
                    setAllEvents(eventResponse.events)
                    setMessage(eventResponse.message)
                    setCanceled(false)

                } else {
                    setMessage(eventResponse.message)
                }
            } catch (err) {
                throw err
            }
        }
        handleUserActivities()
    }, [canceled, setCanceled])

    console.log(allEvents)

    return <div>
        {allEvents !== null &&
            allEvents.map(event => {
                return <EventDetails canceled={canceled} setCanceled={setCanceled} event={event}></EventDetails>
            })
        }
        {message !== null && <div>{message}</div>}
    </div>
}

export default UserActivities;