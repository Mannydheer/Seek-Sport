import React, { useState, useEffect } from "react";
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import Burger from './Burger';

//





const Navbar = () => {



  //user redux state.
  const userLoggedIn = useSelector(state => state.userReducer)
  //dispatch

  const [hover, setHover] = useState(false);
  const visibility = hover ? "visible" : "hidden";



  return <>
    <Header>
      <StyledNav>
        {/* make ul and li */}
        <Burger></Burger>
      </StyledNav>
    </Header>

  </>

}

export default Navbar;



const Header = styled.header`

background-image: linear-gradient(15deg, #13547a 0%, #80d0c7 100%);
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