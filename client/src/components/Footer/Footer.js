import React from 'react';
import styled from 'styled-components';


const Footer = () => {

    return <FooterWrapper>
        <ul>
            <li>Contact</li>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
            <li>Imprint</li>
            <li>© Copyright</li>
        </ul>
        <ul>
            <li>News</li>
            <li>Events</li>
            <li>Videos</li>
            <li>Photos</li>
        </ul>
        <ul>
            <li>Suscribe</li>
            <li>Suscribe to get daily updates</li>
            <li>
                <input type='email' placeholder='Enter your email address'></input>
                <button>Subscribe</button>
            </li>

        </ul>
    </FooterWrapper>



}

export default Footer;

const Suscribe = styled.div`
`
const Email = styled.div`
display: flex;

`

const FooterWrapper = styled.footer`

display: flex;
justify-content: space-evenly;
margin-top: 5rem;
height: 20rem;
width: 100%;
background-image: linear-gradient(to right, #434343 0%, black 100%);color: white;

ul {
    margin-top: 4rem;
    list-style: none;
     li {
         padding: 10px;

         input {
            background-color: #AAAAAA;
            border-radius: 5px;
            color: white;
            height: 2rem;
            width: 12rem;
            padding: 1.1rem;
            border: none;
         }
         button {
             height: 2rem;
             border-radius: 5px;
             margin-left: 1rem;
             width: 10rem;
         }
     }
}

@media screen and (max-width: 768px) {
font-size: 0.8rem;  
padding-left: 5rem;

}

`
