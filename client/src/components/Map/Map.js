import React, { useState, useEffect } from 'react';
//scripts to deploy google maps. 
import { GoogleMap, withScriptjs, withGoogleMap, Marker } from 'react-google-maps';
import {
    requestParks, retrieveParks, retrieveParksError,
    requestHosts, retrieveHosts, retrieveHostsError,
    requestEvents, retrieveEvents, retrieveEventsError
} from '../actions/parkActions';
import { useDispatch, useSelector } from 'react-redux';
//components
import ParkSidebar from '../ParkSidebar';
import styled from 'styled-components';
const Map = ({ coordinates, parkMenu, setParkMenu }) => {
    //pass down coordinates as props.
    const dispatch = useDispatch();
    //stores all nearby parks in store.
    const allParks = useSelector(state => state.parkReducer)
    //all hosted parks in sotre. 
    const hostsInfo = useSelector(state => state.hostReducer)
    //all events in sotre. 
    const allEvents = useSelector(state => state.eventReducer)
    //selected park that you clicked on. 
    const [parkInfo, setParkInfo] = useState(null)
    // ----------------------------Will handle nearby search and get hosted parks from BE-------------------------
    useEffect(() => {
        const handleNearestPlacesAndHosts = async () => {
            dispatch(requestParks())
            let response = await fetch('/nearbySearch', {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(coordinates)
            })
            let nearbyParks = await response.json();
            if (response.status === 200) {
                dispatch(retrieveParks(nearbyParks.results))
            }
            else {
                dispatch(retrieveParksError())
            }
            //----------------------------------------
            //HOSTS - BETTER WAY TO DO THIS.
            dispatch(requestHosts())
            let hostResponse = await fetch('/getParksWithHosts', {
                method: "GET",
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json'
                },
            })
            let allHosts = await hostResponse.json();
            if (hostResponse.status === 200) {
                dispatch(retrieveHosts(allHosts.hosts))
            } else {
                dispatch(retrieveHostsError())
            }
            //----------------------------------------
            dispatch(requestEvents())
            let eventResponse = await fetch('/getEvents', {
                method: "GET",
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json'
                },
            })
            let allEvents = await eventResponse.json();
            if (eventResponse.status === 200) {
                dispatch(retrieveEvents(allEvents.events))

            } else {
                dispatch(retrieveEventsError())
            }
        }
        handleNearestPlacesAndHosts();
        // }
    }, [])
    //control slide in modal for when selecting a park.
    const handleParkSelect = (park) => {
        //load state with the park information clicked on.
        setParkInfo(park)
        //park menu will make modal appear. 
        setParkMenu(!parkMenu)
    }
    return (
        <>
            <Sidebar style={(parkMenu) ? { transform: "translateX(0px)" } : {
                transform: "translateX(-400px)"
            }}>
                {/* park info needs to be loaded.  */}
                {parkMenu && <ParkSidebar parkInfo={parkInfo} parkMenu={parkMenu} setParkMenu={setParkMenu}></ParkSidebar>}
            </Sidebar>
            {/* THE GOOGLE MAP. */}
            <GoogleMap defaultZoom={15}
                center={{ lat: coordinates.lat, lng: coordinates.lng }}>

                {/* RENDER ALL PARKS NEARBY */}
                {allParks.status === 'retrieved parks.' && allEvents.events !== null && allParks.parks.map(park => {
                    //Compare hosted parks with nearby parks. 
                    //if being hosted, render PERSON MARKER(hosts).
                    if (
                        hostsInfo.hosts !== null &&
                        allEvents.events !== null &&
                        allEvents.events[park.id]) {
                        return (
                            <Marker
                                key={park.id}
                                icon={{ url: '/person.png' }}
                                position={park.geometry.location}
                                onClick={() => handleParkSelect(park)}>
                            </Marker>
                        )
                    }
                    //else render RED MARKER(no hosts.)
                    else {
                        return (
                            <Marker
                                key={park.id}
                                position={park.geometry.location}
                                onClick={() => handleParkSelect(park)} />
                        )
                    }
                })}
                <Marker position={coordinates}
                    icon={{ url: '/home.png' }}
                ></Marker>
            </GoogleMap>
        </>
    )
}
//Must wrap within these scrip - read documentaion.
const WrappedMap = withScriptjs(withGoogleMap(Map));
export default WrappedMap;

const Sidebar = styled.div`
display: flex;
flex-direction: column;
flex-wrap: wrap;
   position: fixed; 
    left: 0; 
    width:400px;
    height: 70vh; 
    transition-duration: .7s;
    top: 30vh; 
    background-image: linear-gradient(15deg, #13547a 0%, #80d0c7 100%);
    `