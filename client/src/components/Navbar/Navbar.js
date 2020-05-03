import React, { useState, useEffect } from "react";
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import Login from '../Login';
import Signup from '../Signup';
import { useDispatch, useSelector } from 'react-redux';
import { logOutUser } from '../actions/userActions';

//





const Navbar = () => {



  //user redux state.
  const userLoggedIn = useSelector(state => state.userReducer)
  //dispatch
  const dispatch = useDispatch();

  const [hover, setHover] = useState(false);
  const visibility = hover ? "visible" : "hidden";



  const handleLogout = () => {
    localStorage.removeItem('accesstoken')
    dispatch(logOutUser())
  }

  return <>
    <Header>
      <StyledFlex>
        {/* make ul and li */}
        <NavigationLink exact to='/'><h1>PIKUP</h1></NavigationLink>

        <StyledLoginSignup>

          <NavigationLink exact to='/'><h2>Home</h2></NavigationLink>
          {userLoggedIn.isAuthenticated && <NavigationLink exact to='/userEvents'><h2>My Events</h2></NavigationLink>}
          {userLoggedIn.isAuthenticated && <NavigationLink exact to='/userActivities'><h2>My Activities</h2></NavigationLink>}
          {/* <NavigationLink exact to='/'><h2>Home</h2></NavigationLink> */}
          {!userLoggedIn.isAuthenticated && <Login></Login>}
          {!userLoggedIn.isAuthenticated && <Signup></Signup>}
          <NavigationLink exact to='/chat'><h1>Chat</h1></NavigationLink>


        </StyledLoginSignup>
      </StyledFlex>

      {/* <NavigationLink exact to='/sports'><h2>Find Games</h2></NavigationLink> */}


      {/* Show User Name */}
      {userLoggedIn.status === "authenticated" &&
        <div>
          {/* <StyledName>{userLoggedIn.user.toUpperCase().split('')[0]}</StyledName> */}
          <ImageButton onMouseLeave={() => setHover(false)} onMouseOver={() => setHover(true)}> <UserImage src={`./${userLoggedIn.profileImage}`} />
          </ImageButton>

          <DropDown onMouseLeave={() => setHover(false)} onMouseOver={() => setHover(true)} style={{ visibility }}>
            <StyledLoginButton onClick={handleLogout}>Logout</StyledLoginButton>
            <StyledLoginButton >Edit Profile</StyledLoginButton>
          </DropDown>

        </div>
      }





    </Header>

  </>

}

export default Navbar;

const UserImage = styled.img`
width: 70px;
height: 70px;
position: absolute;
border-radius: 50%;
top: 2%;
right: 2%;
`

const Header = styled.header`

background-image: linear-gradient(15deg, #13547a 0%, #80d0c7 100%);

    height: 5rem; 
    position: relative; 
  
    z-index: 101;
    background-position: right; 



h1 {
  padding: 0 20px 0 20px;
  font-size: 1.3rem;
  padding-top: 10px;
  padding-left: 4rem;  
  
}
h2 {
  
  padding: 0 20px 0 20px;
  font-size: 1.1rem;
  

  
}
nav{
  display: flex;
  justify-content: center;
  padding: 20px;
}

`

const NavigationLink = styled(NavLink)`

  background: none;
  text-decoration: none;
  color: white;
  text-transform: uppercase;
  position: relative;
  z-index: 102;
  display: inline;
&:hover {
  border-bottom: solid white 4px;

}
  
 
`


const StyledName = styled.div`
      background-image: linear-gradient(-60deg, #16a085 0%, #f4d03f 100%);
border-radius: 50%;
position: absolute;
top: 0%;
left: 0.5%;
padding: 10px 20px 10px 20px;
font-size: 1.5rem;
`

const StyledLoginButton = styled.div`
 text-align: center;
  padding: 0 20px 0 20px;
  font-size: 1.1rem;
  background: none;

  transition: 0.5s all ease;
  &:hover {
      cursor: pointer;
      background-image: linear-gradient(15deg, #13547a 0%, #80d0c7 100%);

  }
   
`
const StyledLoginSignup = styled.div`
display: flex;
justify-content: flex-end;
position: relative;
bottom: 1.7rem;
margin-right: 7rem;



   
`

const StyledFlex = styled.div`
`

const DropDown = styled.div`
position: absolute;
top: 5rem;
right:0px;
background-color: white;
`

const ImageButton = styled.button`
width: 70px;
height: 70px;
position: absolute;
border-radius: 50%;
top: 2%;
right: 2%;
background-color: none;
`