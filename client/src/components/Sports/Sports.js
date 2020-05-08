
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { requestParks, retrieveParks, retrieveParksError } from '../actions/parkActions';

import { useDispatch, useSelector } from 'react-redux';
import WrappedMap from '../Map/Map';
import { PageContainer } from '../Constants/Constants'

import MoonLoader from "react-spinners/MoonLoader";




//
import GoogleAddress from '../GoogleAddress';

const parkInfo =
{
    business_status: 'OPERATIONAL',
    formatted_address: 'Rue Fleury O, Montréal, QC H3L 1B9, Canada',
    geometry: {
        location: {
            lat: 45.5440696,
            lng: -73.6655919
        },
        viewport: {
            northeast: {
                lat: 45.54563832989272,
                lng: -73.66410922010726
            },
            southwest: {
                lat: 45.54293867010728,
                lng: -73.66680887989271
            }
        }
    },
    icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/generic_recreational-71.png',
    id: '0954f1fa71a785bbbdc1fce14df48647a9ea5d57',
    name: 'Parc Tolhurst',
    opening_hours: {
        open_now: true
    },
    photos: [
        {
            height: 3456,
            html_attributions: [
                '<a href="https://maps.google.com/maps/contrib/101021804328762220817">paul rossini</a>'
            ],
            photo_reference: 'CmRaAAAAdbfA3pze3_YBS_dpMcBOEopwoHWrSodO-2-fP9-FYJ7KCBcpKhgu7U3T90mz_8W6rFxrFKy0VI9N31LcxlAuN4UakpvJ4pAunHcd_24hpWwlRt2NAqQxfyYRIBpr7w8HEhAi9cdyOZB7i89zi3sfC6BmGhTDUSvzr4pYleLWaKaLxXi8SHz_oA',
            width: 4608
        }
    ],
    place_id: 'ChIJwUGDhpMYyUwRMCTSeBh8Z8E',
    plus_code: {
        compound_code: 'G8VM+JQ Montreal, Quebec',
        global_code: '87Q8G8VM+JQ'
    },
    rating: 4.3,
    reference: 'ChIJwUGDhpMYyUwRMCTSeBh8Z8E',
    types: [
        'park',
        'point_of_interest',
        'establishment'
    ],
    user_ratings_total: 143
}



const Sports = () => {

    const userLoggedIn = useSelector(state => state.userReducer)
    const [coordinates, setCoordinates] = useState({
        lat: null,
        lng: null
    })

    //lift up park menu so it's accessible to MAP and GOOGLE ADDRESS COMPONENT
    //controls the side bar on search and click.
    const [parkMenu, setParkMenu] = useState(false);





    //sliding info modal.

    return (
        <Wrapper>
            {/* <button onClick={() => setParkMenu(!parkMenu)}>OPEN</button>


            <div>
                < Sidebar style={(parkMenu) ? { transform: "translateX(0px)" } : {
                    transform: "translateX(-400px)"
                }}>
                    <Wrapper2>
                        <Title>
                            <h1>{parkInfo.name}</h1>
                            <img src={parkInfo.icon}></img>
                        </Title>

                        <h2>{parkInfo.formatted_address}</h2>
                        <div>Ratings: {parkInfo.user_ratings_total}</div>
                        <div>
                            <button>Host</button>
                            <button>View Activities</button>
                        </div>
                    </Wrapper2>
                    <i class="fa fa-times" aria-hidden="true"></i>

                    {parkMenu && <Btn onClick={() => setParkMenu(false)}>X</Btn>}

                </Sidebar>

            </div> */}


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



///

// const Sidebar = styled.div`
// display: flex;
// flex-direction: column;
// flex-wrap: wrap;

//    position: fixed; 
//     left: 0; 
//     width:400px;
//     height: 70vh; 
//     transition-duration: .7s;
//     top: 27vh; 

//     background-image: linear-gradient(-60deg, #16a085 0%, #f4d03f 100%);

//     `
// const Btn = styled.div`
// position: absolute;
// top: 0vh;
// left: 375px;
// z-index: 101;
// transition-duration: 5s;
// border: none;
// outline: none;
// border-radius: 50%;
// margin-right: 10px;
// margin-top: 10px;
// &:hover {
//     cursor: pointer;
// }


// `

// const Wrapper2 = styled.div`
// word-wrap: break-word;
// padding-right: 4rem;
//     padding-bottom: 20px; 
//     margin: 2rem 0;
//     width: 400px;
//     text-align: center;
//     font-size: 1rem;

//     h2 {
//         font-size: 1.1rem;
//         padding: 1rem;
//     }
// `

// const Title = styled.div`
// margin-top: 2.5rem;
// display: flex;
// justify-content: center;
// position: relative;

// img {
//     position: absolute;
//     bottom: 40px;
// }


// `
