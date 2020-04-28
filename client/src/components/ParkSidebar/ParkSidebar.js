import React, { useState, useEffect } from 'react';
import styled from 'styled-components'
import { AiOutlineClose } from 'react-icons/ai';
import { Link, useHistory } from 'react-router-dom';


import { useDispatch, useSelector } from 'react-redux';
import { selectPark } from '../actions/parkActions';
import ParkDetails from '../ParkDetails';






const ParkSidebar = ({ parkInfo, parkMenu, setParkMenu }) => {

    console.log(parkInfo)
    let history = useHistory();
    const dispatch = useDispatch();


    const userLoggedIn = useSelector(state => state.userReducer)
    const hostsInfo = useSelector(state => state.hostReducer)
    const allEvents = useSelector(state => state.eventReducer)




    const handleHostView = () => {
        //store the select park into the redux store.
        dispatch(selectPark(parkInfo))
        history.push('/hostPark')
    }
    const handleViewActivity = () => {
        //store the select park into the redux store.
        dispatch(selectPark(parkInfo))
        history.push('/viewActivity')
    }

    return (
        <>

            {parkMenu &&
                <Wrapper>
                    {/* details about the park. */}
                    <ParkDetails parkInfo={parkInfo}></ParkDetails>

                    <BtnWrapper>
                        {<Buttons onClick={handleHostView}>Host Activity</Buttons>}
                        {/* You can only host when there is red marker. */}
                        {allEvents.events[parkInfo.id] && <Buttons onClick={handleViewActivity}>View Activity</Buttons>}

                    </BtnWrapper>
                    {parkMenu && <Btn onClick={() => setParkMenu(false)}><AiOutlineClose></AiOutlineClose></Btn>}

                </Wrapper>}





        </>

    )

}


export default ParkSidebar;

const Btn = styled.div`
position: absolute;
top: 0vh;
left: 375px;
z-index: 101;
transition-duration: 5s;
border: none;
outline: none;
margin-right: 10px;
margin-top: 10px;
&:hover {
    cursor: pointer;
}
`
const BtnWrapper = styled.div`
display: flex;
justify-content: space-around;
padding-top: 15px;
`

const Buttons = styled.button`
border-radius: 25px;
font-size: 1.1rem;
outline: none;

&:hover {
    cursor: pointer;
}


`


const Wrapper = styled.div`

word-wrap: break-word;
padding-right: 4rem;
    padding-bottom: 20px; 
    margin: 2rem 0;
    width: 400px;
    text-align: center;
    font-size: 1rem;
    
    /* h2 {
        font-size: 1.1rem;
        padding: 1rem;
    } */
`

