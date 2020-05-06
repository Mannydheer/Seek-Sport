import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Rooms = ({ event }) => {



    return <>
        <Wrapper>
            {event._id}
        </Wrapper>
    </>

}

export default Rooms;

const Wrapper = styled.div`
border-radius: 10px;
border: solid black 2px;
padding: 5px;
margin: 10px;



`