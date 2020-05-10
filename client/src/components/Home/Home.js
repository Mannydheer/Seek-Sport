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
                <BigTitle>FIND ANY SPORT NEARBY</BigTitle>

                <NavigationLink exact to='/sports'><h2>Find Games</h2></NavigationLink>

                {/*  */}
            </StyledHomeImg>

            {/*TEXT */}
            <h3>The fastest way to find games in your area.</h3>
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
                    <SportName>basketball</SportName>
                    <Image src={'./basket.jpg'}></Image>
                </div>
                <div>
                    <SportName>Tennis</SportName>
                    <Image src={'./Tennis.jpg'}></Image>
                </div>
                <div>
                    <SportName>Soccer</SportName>
                    <Image src={'./soccer.jpg'}></Image>
                </div>
                <div>
                    <SportName>Badminton</SportName>
                    <Image src={'./badminton.jpg'}></Image>
                </div>
                <div>
                    <SportName>Hockey</SportName>
                    <Image src={'./Hockey.jpg'}></Image>
                </div>
                <div>
                    <SportName>Volleyball</SportName>
                    <Image src={'./volleyball.jpg'}></Image>
                </div>
                <div>
                    <SportName>Baseball</SportName>
                    <Image src={'./baseball.jpg'}></Image>
                </div>
            </ImagesWrapper>
            {/* PURPOSE */}
            <PurposeWrapper>
                <PurposeText>
                    <div>We help people stay active daily</div>
                    <p>Finding people who want to play the same sport, at the same time, in the same area is hard and that's the reason why most of us end up not playing sport at all. Seek&Sport helps you connect with people around you, with similar profiles, and start playing the sport of your choice. </p>
                </PurposeText>
                <Field src='/Field.jpg'></Field>
            </PurposeWrapper>
        </Wrapper>
    )
}

export default Home;
const BigTitle = styled.div`
text-align: center;
margin-top: 50px;
font-size: 2rem;
@media screen and (max-width: 768px) {
font-size: 2rem;                 
}
`
const Wrapper = styled.div`
width: 100vw;
h3 {
text-transform: uppercase;
text-align: center;
padding: 1rem;
border-bottom: lightgray 2px solid;  
}
`
const StyledHomeImg = styled.div`
width: 100vw;
height: 80vh;    
background-image: linear-gradient(15deg, #13547a 0%, #80d0c7 100%);
position: relative; 
bottom: 1rem;
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
div {
display: flex;
position: absolute;
left: 50%;
top: 40%;
transform: translate(-50%, 150%);
}
a {
display: flex;
position: absolute;
left: 50%;
top:55%;
transform: translate(-50%, 150%);
}
@media screen and (max-width: 768px) {
h1 {
    font-size: 2rem;
}                   
}
`
const NavigationLink = styled(NavLink)`
  font-size: 1.1rem;
  background: none;
  border-radius: 10px;
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

// -----------------------------INFOSECTION----------------------
const InfoSection = styled.div`
display: flex;
justify-content: space-evenly;
margin: 4rem;
@media screen and (max-width: 768px) {
display: block;
text-align: center;
h1 {
     font-size: 2rem,;
}              
}
@media screen and (max-width: 420px) {
h1 {
    font-size: 1.5rem;
}                
 }
`
const BasketBall = styled.img`
width: 30rem;
height: 25rem;
@media screen and (max-width: 768px) {
    width: 25rem;
height: 20rem;
}         
@media screen and (max-width: 420px) {
width: 27rem;
height: 22rem;              
}
`
const Rules = styled.div`
h1 {
font-size: 3rem;
word-wrap: none;
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
@media screen and (max-width: 768px) {
display: block;
h1 {
font-size: 2.5rem;
}
div {
text-transform: uppercase;
margin: 1.2rem;
font-size: 1.4rem;
}
button {
font-size: 1.5rem;
left: 0;
}
 }
 @media screen and (max-width: 420px) {
display: block;
h1 {
font-size: 2rem;
text-align: center;
margin-top: 1.1rem;
}     
div {
margin: 1.2rem 0;
font-size: 1.2rem;
text-align: center;
}         
button {
    font-size: 1.5rem;left: 0;
}             
 }
`
const PurposeText = styled.div`
width: 20rem;
div {
    font-size: 2.5rem;
    text-transform: uppercase;
    border-bottom: lightgray 2px solid;    
}
@media screen and (max-width: 768px) {
width: 80%;
margin: 0 auto;
div {
    font-size: 2rem;   
}
             
 }
`

const PurposeWrapper = styled.div`
display: flex;
justify-content: space-evenly;
margin-top: 3rem;
@media screen and (max-width: 768px) {
    display: block;
   text-align: center;
             
 }
 @media screen and (max-width: 420px) {
             
 }

`
const Field = styled.img`
width: 35rem;
border-radius: 25px;


@media screen and (max-width: 768px) {
    width: 25rem;
             
 }
`


// SLIDESHOW IMAGES.
const ImagesWrapper = styled.div`

height: 25rem;
width: 100%;
display: flex;
background-image: linear-gradient(15deg, #13547a 0%, #80d0c7 100%);
overflow-x: scroll;

div {
    color: white;
    text-align: center;
    margin-top: 3rem;
    padding: 0 5rem;
    
}

@media screen and (max-width: 420px) {
     div {
        padding: 0 2rem;
}         

 }
`

const Image = styled.img`
width: 20rem;
height: 15rem;
position: relative;
top: 15%;
object-fit: cover;



border: white solid 5px;
border-radius: 25px;
`

const SportName = styled.h4`
font-size: 1.5rem;
text-transform: uppercase;

`