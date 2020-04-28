import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import EventDetails from '../EventDetails';

//components.
import ParkDetails from '../ParkDetails'



const ViewActivity = () => {



    const dispatch = useDispatch();
    //stores all nearby parks in store.
    const allParks = useSelector(state => state.parkReducer)
    //all hosted parks in sotre. 
    const hostsInfo = useSelector(state => state.hostReducer)
    //all events in sotre. 
    const allEvents = useSelector(state => state.eventReducer)

    const userInfo = useSelector(state => state.userReducer)


    const [parkInfo, setParkInfo] = useState(null)
    const [hostedEvent, setHostedEvents] = useState(null)
    //error
    const [error, setError] = useState(false)

    //on component mount.
    useEffect(() => {
        //get the selected park. 
        setParkInfo(allParks.selectedPark);
        //find all hosts that are in this park.
        //for the parkId, get all hosts who match this id.
        //see if selectedPark has something inside.
        if (allParks.selectedPark !== null) {
            let matchedEvents = allEvents.events[allParks.selectedPark.id]
            console.log(matchedEvents, 'MATCHEDEVENTS')
            setHostedEvents(matchedEvents)
        }
        else {
            setError(true)
        }
    }, [])

    // useEffect(() => {

    //     //check if the user logged in is hosting any of his own games.
    //     //cannot join his own games.
    //     if (hostsInfo.hosts !== null) {
    //         let matchedUser = hostsInfo.hosts.find(host => {
    //             if (host.userId === userInfo._id) {
    //                 return host;
    //             }
    //         })
    //     }
    //     else {
    //         setError(true)
    //     }



    // }, [])

    console.log(hostedEvent)





    return (
        <>
            {!error ? <div>
                {parkInfo !== null && <ParkDetails parkInfo={parkInfo} ></ParkDetails>}
                {/**/}
                {hostedEvent !== null &&
                    hostedEvent.map(event => {
                        return <EventDetails event={event}></EventDetails>
                    })
                }
            </div> : <div style={{ textAlign: 'center' }}>Please head over to the sports tab to view park acitivities.</div>}
        </>
    )

}

export default ViewActivity;

const Wrapper = styled.div`

`


//NOTES:
    //For now, can only view activities from searching a park as the useEffect that gets
    //all hosts happens in that component(MAP componenet.)