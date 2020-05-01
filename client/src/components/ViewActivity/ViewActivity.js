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

    const [canceled, setCanceled] = useState(false)


    const [hostedEvent, setHostedEvents] = useState(null)


    //error
    const [error, setError] = useState(false)

    //on component mount.
    useEffect(() => {
        //onMount, get the events for the selectedPark.
        if (allParks.selectedPark !== null) {
            const handleSelectedParkEvents = async () => {
                let token = localStorage.getItem('accesstoken')
                try {
                    let response = await fetch(`/selectedParkEvents/${allParks.selectedPark.id}`, {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            'Authorization': `${token}`
                        },
                    })
                    let eventResponse = await response.json();
                    if (eventResponse.status === 200) {
                        setHostedEvents(eventResponse.events)
                    } else {
                        setError(true)
                    }
                } catch (err) {
                    throw err
                }
            }
            handleSelectedParkEvents()
        }
        else {
            return
        }
    }, [, canceled, setCanceled])

    console.log(hostedEvent, 'HOSTED EVENTS')

    return (
        <>
            {!allParks.selectedPark !== null ? <div>
                {allParks.selectedPark !== null && <ParkDetails parkInfo={allParks.selectedPark} ></ParkDetails>}
                {/**/}
                {hostedEvent !== null && allParks.selectedPark !== null &&
                    hostedEvent.map(event => {
                        return <EventDetails canceled={canceled} setCanceled={setCanceled} event={event}></EventDetails>
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