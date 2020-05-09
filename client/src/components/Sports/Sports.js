
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import WrappedMap from '../Map/Map';
import MoonLoader from "react-spinners/MoonLoader";
import GoogleAddress from '../GoogleAddress';


const Sports = () => {
    const userLoggedIn = useSelector(state => state.userReducer)
    const [coordinates, setCoordinates] = useState({
        lat: null,
        lng: null
    })
    //lift up park menu so it's accessible to MAP and GOOGLE ADDRESS COMPONENT
    //controls the side bar on search and click.
    const [parkMenu, setParkMenu] = useState(false);
    return (
        <Wrapper>
            {
                userLoggedIn.status !== "authenticated" ?
                    <h1>You must be logged in to find games.
                    </h1> :
                    <div>
                        {/* // */}
                        <div style={{ padding: '10px' }}>
                            <h2>
                                Enter your location to start finding activities at your local park!
                                </h2>
                            <GoogleAddress setParkMenu={setParkMenu} setCoordinates={setCoordinates}></GoogleAddress>
                        </div>
                        {/* //call component to find games. */}
                        <StyledMap style={{ width: '100vw', height: '80vh' }}>
                            {coordinates.lat !== null && <WrappedMap
                                parkMenu={parkMenu}
                                setParkMenu={setParkMenu}
                                coordinates={coordinates}
                                googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyAt-D4AMalUpyQjUe3laQYyjjNgy_hcCOc`}
                                loadingElement={<div style={{ height: '100%' }}></div>}
                                containerElement={<div style={{ height: '100%' }}></div>}
                                mapElement={<div style={{ height: '100%' }}></div>}
                            ></WrappedMap>}
                        </StyledMap>
                    </div>
            }
        </Wrapper >
    )
}
export default Sports;
const Wrapper = styled.div`

h1 {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, 50%);
    font-size: 3rem;
    
}

h2 {
    text-align: center;
    padding: 1.5rem;
}
height: 100vh;

`

const StyledMap = styled.div`
margin-top: 50px;
`
