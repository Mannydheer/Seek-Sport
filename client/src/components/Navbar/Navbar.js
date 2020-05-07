import React, { useState, useEffect } from "react";
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import Login from '../Login';
import Signup from '../Signup';
import { useDispatch, useSelector } from 'react-redux';
import { logOutUser } from '../actions/userActions';
import RightNav from './RightNav';
import Burger from './Burger';

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
      <StyledNav>
        {/* make ul and li */}
        <Burger></Burger>
      </StyledNav>

      {/* <NavigationLink exact to='/sports'><h2>Find Games</h2></NavigationLink> */}
      {/* Show User Name */}
      {userLoggedIn.status === "authenticated" &&
        <div>
          {/* <StyledName>{userLoggedIn.user.toUpperCase().split('')[0]}</StyledName>
          <ImageButton onMouseLeave={() => setHover(false)} onMouseOver={() => setHover(true)}> <UserImage src={`./${userLoggedIn.profileImage}`} />
          </ImageButton>
          <DropDown onMouseLeave={() => setHover(false)} onMouseOver={() => setHover(true)} style={{ visibility }}>
            <StyledLoginButton onClick={handleLogout}>Logout</StyledLoginButton>
            <StyledLoginButton >Edit Profile</StyledLoginButton>
          </DropDown> */}

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

/* background-image: linear-gradient(15deg, #13547a 0%, #80d0c7 100%); */

    height: 5rem; 
    position: relative; 
  
    z-index: 101;
    background-position: right; 

`

const StyledNav = styled.nav`
width: 100%;


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