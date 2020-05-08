import React, { useState, useEffect } from "react";
import styled from 'styled-components';
import { NavLink, } from 'react-router-dom';
import Login from '../Login';
import Signup from '../Signup';
import { useDispatch, useSelector } from 'react-redux';
import { logOutUser } from '../actions/userActions';






const RightNav = ({ open }) => {
  console.log(open, 'INSIDE RIGHTNAV')

  const userLoggedIn = useSelector(state => state.userReducer)

  const dispatch = useDispatch();


  const handleLogout = () => {
    localStorage.removeItem('accesstoken')
    dispatch(logOutUser())
  }

  return (<>
    <div>
      <Ul open={open}>
        <NavigationLink exact to='/'><li style={{ textAlign: 'center' }}>Seek&Sport</li></NavigationLink>
        <NavigationLink exact to='/'><li>Home</li></NavigationLink>
        {userLoggedIn.isAuthenticated && <NavigationLink exact to='/userEvents'><li>My Events</li></NavigationLink>}
        {userLoggedIn.isAuthenticated && <NavigationLink exact to='/userActivities'><li>My Activities</li></NavigationLink>}
        {userLoggedIn.isAuthenticated && <NavigationLink exact to='/chat'><li>Chat Room</li></NavigationLink>}
        {!userLoggedIn.isAuthenticated && <Login></Login>}
        {!userLoggedIn.isAuthenticated && <Signup></Signup>}

        {userLoggedIn.isAuthenticated && <UserImage src={`./${userLoggedIn.profileImage}`} />}
        {userLoggedIn.isAuthenticated && <List onClick={handleLogout}>Logout</List>}

      </Ul>
    </div>
  </>
  )
}

export default RightNav;

const StyledName = styled.div`
`
const UserImage = styled.img`
width: 70px;
height: 70px;
position: absolute;
border-radius: 50%;
top: 2%;
right: 2%;

@media (max-width: 768px) {

  left: 0;
  top: 0;
  margin: 0.5rem;

}
`

const Ul = styled.ul`
  list-style: none;
  display: flex;
  justify-content: center;

  /* shorthand for flex direction row and no wrap. */
li {
  padding: 0 1.2rem;
  margin-top: 1.2rem;
}




@media (max-width: 768px) {
    display: block;
    background-color: #0D2538;
    position: fixed;
    transform: ${({ open }) => open ? 'translateX(0)' : 'translateX(100%)'};

    top: 0;
    right: 0;
    height: 100vh;
    width: 300px;
    padding-top: 3.5rem;
    transition: transform 0.3s ease-in-out;
   

    li {
        color: white;
    }
    a {
        
    }
}
`
const NavigationLink = styled(NavLink)`

  text-decoration: none;
  color: white;
  text-transform: uppercase;
  position: relative;
  cursor: pointer;
  
  @media screen and (min-width: 768px) {
    &:nth-child(1) {
    position: absolute;
    left: 2rem;
    
    }                   
  }

  

/* inserts content after it is selected. */
/* like having a div under it. */
&:nth-child(n+2)&:after {
    content: '';
    display: block;
    width: 0;
    height: 2px;
    background: white;
    
  }
  /* on hover over ... give it 100% width so we see it. */
  &:nth-child(n+2)&:hover::after {
    width: 100%;
    transition: width .3s;

  }
`


//CONSTANT REUSE - REFACTOR
const List = styled.li`
  text-decoration: none;
  color: white;
  text-transform: uppercase;
  position: relative;
  cursor: pointer;
/* inserts content after it is selected. */
/* like having a div under it. */
&:after {
    content: '';
    display: block;
    width: 0;
    height: 2px;
    background: white;
  }
  /* on hover over ... give it 100% width so we see it. */
  &:hover::after {
    width: 100%;
    transition: width .3s;
  }
`







