import React from 'react'
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';



const EventDetails = ({ event }) => {

    const userInfo = useSelector(state => state.userReducer)
    return (
        <Wrapper key={event._id}>
            <h1>Host: {event.name}</h1>
            <h2>Sport: {event.sport}</h2>
            <h2>Skill: {event.skill}</h2>
            <h2>Time: {event.time}</h2>
            {event.userId !== userInfo._id && <button>Join</button>}
        </Wrapper>
    )
}


export default EventDetails;
const Wrapper = styled.div`
`