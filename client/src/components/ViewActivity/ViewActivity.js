import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import EventDetails from "../EventDetails";
//components.
import ParkDetails from "../ParkDetails";
const ViewActivity = () => {
  //stores all nearby parks in store.
  const allParks = useSelector((state) => state.parkReducer);
  const [canceled, setCanceled] = useState(false);
  const [hostedEvent, setHostedEvents] = useState(null);
  //error
  //on component mount.
  useEffect(() => {
    let unmounted = false;
    //cleanup
    if (!unmounted) {
      //onMount, get the events for the selectedPark.
      if (allParks.selectedPark !== null) {
        const handleSelectedParkEvents = async () => {
          let token = localStorage.getItem("accesstoken");
          try {
            let response = await fetch(
              `/selectedParkEvents/${allParks.selectedPark.id}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  Authorization: `${token}`,
                },
              }
            );
            let eventResponse = await response.json();
            if (eventResponse.status === 200) {
              setHostedEvents(eventResponse.events);
              //setCanceled will be turned to true if a cancel occurs.
              //this will cause useEffect to refetch event data.
              setCanceled(false);
            }
          } catch (err) {
            throw err;
          }
        };
        handleSelectedParkEvents();
      } else {
        return;
      }
    }
    return () => {
      unmounted = true;
    };
  }, [canceled, setCanceled]);
  return (
    <>
      {!allParks.selectedPark !== null ? (
        <PageContainer>
          {allParks.selectedPark !== null && (
            <StyledParkDetails>
              <ParkDetails parkInfo={allParks.selectedPark} />
            </StyledParkDetails>
          )}
          {/**/}
          {hostedEvent !== null &&
            allParks.selectedPark !== null &&
            hostedEvent.map((event, index) => {
              return (
                <EventDetailsWrapper
                  key={`${event.placeId}${event.participantId}`}
                >
                  <EventDetails
                    index={index}
                    canceled={canceled}
                    setCanceled={setCanceled}
                    event={event}
                  ></EventDetails>
                </EventDetailsWrapper>
              );
            })}
        </PageContainer>
      ) : (
        <div style={{ textAlign: "center" }}>
          Please head over to the sports tab to view park acitivities.
        </div>
      )}
    </>
  );
};

export default ViewActivity;

const Wrapper = styled.div``;
const StyledParkDetails = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  width: 80%;
  margin-left: auto;
  margin-right: auto;

  div {
    font-size: 2rem;
    width: 100%;

    text-align: center;
  }
`;
const PageContainer = styled.div`
  box-shadow: 0 10px 10px -5px;
  width: 80%;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  height: 100%;
  padding-bottom: 2rem;
`;

const EventDetailsWrapper = styled.div`
  h1 {
    font-size: 1rem;
  }

  h2 {
    font-size: 1.1rem;
  }
  img {
    width: 100px;
    height: 100px;
  }
`;
