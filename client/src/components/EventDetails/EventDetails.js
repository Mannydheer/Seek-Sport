import React from 'react'
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import Join from '../Join';



const EventDetails = ({ event }) => {

    const userInfo = useSelector(state => state.userReducer)


    return (
        <Wrapper key={event._id}>
            <h1>Host: {event.name}</h1>
            <h2>Sport: {event.sport}</h2>
            <h2>Skill: {event.skill}</h2>
            <h2>Time: {event.readTime}</h2>
            <h2>Date: {event.bookedDate}</h2>
            <h2>Duration: {event.duration} hr</h2>
            {event.userId !== userInfo._id && <Join event={event}>Join</Join>}
        </Wrapper>
    )
}


export default EventDetails;
const Wrapper = styled.div`
   display: grid;
    /* grid-template-columns: repeat(auto-fill, minmax(150px, 310px)); */
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr) );
    grid-column-gap: 60px;
    grid-row-gap: 10px;
`