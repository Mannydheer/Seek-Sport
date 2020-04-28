import React from 'react';
import styled from 'styled-components';
import { PageWrapper } from '../Constants/Constants'
import mainImage from '../../Images/SportHome.jpg'
import { NavLink, useHistory } from 'react-router-dom';




const Home = () => {

    const history = useHistory();

    return (
        <Wrapper>
            {/* MAIN IMAGE. */}
            <StyledHomeImg>
                <img src='/running.png'></img>
                <h1>FIND ANY SPORT NEARBY</h1>
                <div>
                    <NavigationLink exact to='/sports'><h2>Find Games</h2></NavigationLink>
                </div>
                {/*  */}
            </StyledHomeImg>

            {/*TEXT */}
            <h3>The fastest way to find pick up games in your area.</h3>
            <InfoSection>
                <BasketBall src='/Basketball.jpg'></BasketBall>
                <Rules>
                    <h1>Play Sports Now</h1>
                    <div>1. Enter your address</div>
                    <div>2. Find parks in your area</div>
                    <div>3. Join or Host a game</div>
                    <button onClick={() => history.push('/sports')}>Start Now</button>
                </Rules>
            </InfoSection>
            {/* IMAGES */}
            <ImagesWrapper>
                <div>
                    <div>Soccer</div>
                </div>
                <div>
                    <div>Tennis</div>
                </div>
                <div>
                    <div>BasketBall</div>
                </div>
                <div><div>Footbal</div></div>
                <div><div>Badminton</div></div>
                <div><div>Hockey</div></div>
            </ImagesWrapper>

            {/* PURPOSE */}
            <PurposeWrapper>
                <PurposeText>
                    <div>We help people stay active daily</div>
                    <p>ageMaker including versions of including versi including versi including versi including versi including versi including versi including versi including versi including versi including versi including versi including versi including versi including versi including versi including versi Lorem Ipsum.</p>

                </PurposeText>
                <Field src='/Field.jpg'></Field>
            </PurposeWrapper>

        </Wrapper>



    )

}

export default Home;

const StyledHomeImg = styled.div`

background-image: linear-gradient(15deg, #13547a 0%, #80d0c7 100%);
    height: 50rem; 
    position: relative; 
    bottom: 5rem;
    background-position: right; 
    color: white;
    z-index: 100;

    img {
  width: 20rem;
  height: 20rem;
  position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -100%);
}

h1 {
    text-align: center;
    position:relative;
    top: 22rem;
    font-size: 4rem;
}
div {
    display: flex;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, 150%);
}

`

const NavigationLink = styled(NavLink)`
    /* text-decoration: none;
    color: black;
    font-weight: 600; 
    transition-duration: 400ms; 
    border-radius: 25px; */
  font-size: 1.1rem;
  background: none;
  border-radius: 25px;
  border: solid white 2px;
  transition: 0.5s all ease;
  text-decoration: none;
  padding: 10px;
  margin: 5px;
  color: white;

  &:hover {
      opacity: 0.4;
      cursor: pointer;
      
  }
  
 
`


const Wrapper = styled.div`
h3 {
    text-transform: uppercase;
    text-align: center;
    padding: 2rem;
    border-bottom: lightgray 2px solid;  
    margin: 0 auto;
    width: 80%;
}
`

const BasketBall = styled.img`
width: 30rem;
height: 25rem;
`
const Field = styled.img`
width: 30rem;
height: 25rem;
border-radius: 25px;
`


const Rules = styled.div`

h1 {
    font-size: 3.5rem;
}


div {
    text-transform: uppercase;
    margin: 2rem;
    font-size: 1.5rem;
}

button {
    text-transform: uppercase;
    background-color: black;
    border-radius: 10px;
    color: white;
    padding: 10px;
    font-size: 1.3rem;
    position: relative;
    left: 7rem;
    outline: none;

    &:hover {
        cursor: pointer;
        opacity: 0.8;
    }
}


`

const InfoSection = styled.div`
display: flex;
justify-content: space-evenly;
margin: 4rem;

`


const PurposeText = styled.div`

width: 20rem;


div {
    font-size: 3rem;
    text-transform: uppercase;
    border-bottom: lightgray 2px solid;  
   
}
`

const PurposeWrapper = styled.div`
display: flex;
justify-content: space-evenly;
margin-top: 3rem;

`


const ImagesWrapper = styled.div`

height: 15rem;
width: 100vw;
background-image: linear-gradient(15deg, #13547a 0%, #80d0c7 100%);
`