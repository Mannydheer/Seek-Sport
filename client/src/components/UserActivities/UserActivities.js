import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import EventDetails from '../EventDetails';
import ClipLoader from "react-spinners/ClipLoader";
import { css } from "@emotion/core";





const UserActivities = () => {

    const userLoggedIn = useSelector(state => state.userReducer)
    const [allEvents, setAllEvents] = useState(null)
    const [canceled, setCanceled] = useState(false)
    const [message, setMessage] = useState(null)

    const override = css`
 display: block;
  margin: 0 auto;
`;





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

    return <Wrapper>
        <Title>Current Events.
            <TitleText>See details for all the events you are attending.</TitleText>
        </Title>

        {allEvents !== null ?
            allEvents.map((event, index) => {
                return <EventDetails index={index} canceled={canceled} setCanceled={setCanceled} event={event}></EventDetails>
            }) : <ClipLoader css={override}
                size={150} color={"black"} />
        }
        {/* {message !== null && <div>{message}</div>} */}
    </Wrapper>
}

export default UserActivities;


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
