import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import ParkDetails from '../ParkDetails';
import DatePicker from "react-datepicker";
import { skillLevel, sports } from '../data';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import EventDetails from '../EventDetails';
import "react-datepicker/dist/react-datepicker.css";

const useStyles = makeStyles(theme => ({
    root: {
        background: "linear-gradient(15deg, #13547a 0%, #80d0c7 100%)",
        border: 0,
        borderRadius: 3,
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        color: 'white',
        height: '3rem',
        width: '10rem',
        outline: 'none',
        padding: '0 10px',
    },
    formControl: {
        display: 'flex',
        borderTop: 'black solid 0.5px',
        paddingTop: '3rem',
        margin: '0 auto',
        width: '80%',
        fontFamily: 'Comfortaa, cursive',
        flexFlow: 'wrap'
    }
}));
const validateDateBooking = (startDate) => {
    //Todays day and month.
    let currentDate = new Date().toLocaleDateString().split('/');
    let currentMonth = parseInt(currentDate[0])
    let currentDay = parseInt(currentDate[1])
    //booking date.
    let bookingDate = new Date(startDate).toLocaleDateString().split('/');
    let bookingMonth = parseInt(bookingDate[0])
    let bookingDay = parseInt(bookingDate[1])

    //

    //convert everything to minutes for the specific day.
    let currentTime = new Date().getHours() * 60 + new Date().getMinutes();
    let selectedTime = new Date(startDate).getHours() * 60 + new Date(startDate).getMinutes();
    let morningLimit = 7.5 * 60;
    let nightLimit = 22 * 60;
    //compare month and day of booking.
    //year CHECKING NOT DONE.
    //if its any day past today... no problems trying to book.
    //backend will handle conflicts if there are any.
    if (bookingMonth >= currentMonth && bookingDay > currentDay) {
        if (selectedTime >= currentTime
            && selectedTime <= nightLimit
            && selectedTime >= morningLimit) {
            return true;
        }
        else {
            return false;
        }
    }
    //if its the same day... then check for time.
    else if (bookingMonth === currentMonth && bookingDay === currentDay) {
        console.log('inside same day')
        console.log(typeof currentTime, typeof selectedTime)
        //if the total minutes selected is greater or equal to the current minutes...
        //these means that we are either at the same time or past the time...
        //ALSO - we need to make sure the time is between 7:30AM-10PM;
        //thne we are allowed to book.
        if (selectedTime >= currentTime
            && selectedTime <= nightLimit
            && selectedTime >= morningLimit) {
            return true;
        }
        //if not.... cannot book
        else {
            return false;
        }
    }
    //if its past the date.
    else {
        return false
    }
}
//-----------------------------------COMPONENT---------------------------------
const Host = () => {
    //for modal class.
    const classes = useStyles();
    const userLoggedIn = useSelector(state => state.userReducer);
    //use this for real.
    const selectedPark = useSelector(state => state.parkReducer.selectedPark);
    const [sportSelect, setSportSelect] = useState("Choose sport");
    const [skillSelect, setSkillSelect] = useState("Choose skill level");
    const [duration, setDuration] = useState("Choose duration");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [startDate, setStartDate] = useState(new Date())
    const [canceled, setCanceled] = useState(false)
    const [groupName, setGroupName] = useState(null)
    const [conflictEvent, setConflictEvent] = useState(null);

    const handleHostInformation = async (event) => {
        event.preventDefault();
        setConflictEvent(null)
        setSuccess(false)
        //---------------------TIME ----------------------------
        if (sportSelect !== "Choose sport" &&
            skillSelect !== "Choose skill level" &&
            duration !== "Choose duration" && groupName !== null &&
            selectedPark !== null) {
            //now check if it is the same date first....
            let validDate = validateDateBooking(startDate)
            //if a valid date is chosen.
            console.log(validDate)
            if (validDate) {
                let hostingInformation = {
                    name: userLoggedIn.user,
                    userId: userLoggedIn._id,
                    profileImage: userLoggedIn.profileImage,
                }
                let eventInformation = {
                    name: userLoggedIn.user,
                    //whoever is currently logged in.
                    userId: userLoggedIn._id,
                    sport: sportSelect,
                    skill: skillSelect,
                    //replace witht he actual park. 
                    parkId: selectedPark.id,
                    parkName: selectedPark.name,
                    groupName: groupName,
                    placeId: selectedPark.place_id,
                    Registration: new Date(),
                    isBooked: true,
                    readTime: startDate.toLocaleTimeString(),
                    bookedDate: startDate.toLocaleDateString(),
                    time: startDate,
                    duration: parseInt(duration)
                }
                let token = localStorage.getItem('accesstoken')
                try {
                    let response = await fetch("/hostingInformation", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            'Authorization': `${token}`
                        },
                        body: JSON.stringify({
                            eventInformation: eventInformation,
                            hostingInformation: hostingInformation
                        })
                    })
                    let hostResponse = await response.json()
                    //ADD DISPATCHED?
                    if (hostResponse.status === 200) {
                        setSuccess(hostResponse.message)
                        setError(false)
                    }
                    else if (hostResponse.status === 400) {
                        setError(hostResponse.message)
                    }
                    else if (hostResponse.status === 409) {
                        setError(hostResponse.message)
                        console.log(hostResponse.timeConflictPark)
                        setCanceled(false)
                        //the backend should take care in that it will only send back 1 event
                        //there should never be a case where you can book two events at the same time as a single user.
                        setConflictEvent(hostResponse.timeConflictPark)
                    }
                }
                catch (err) {
                    console.log(err, "catch error inside handleHosting in Host component.")
                }
            }
            else {
                setError('Make sure you pick a valid day and time!')
            }
        }
        //if any of the cases fail. 
        else {
            setError('Make sure all fields have been selected and that a valid time was selected.')
        }
    }
    const handleChange = (date) => {
        console.log(date)
        setSuccess(false)
        setStartDate(date)
        setConflictEvent(null)
        setError(false)
    };
    useEffect(() => {
        setError(false)
        setConflictEvent(null)
        setCanceled(false)
    }, [canceled])
    return (
        <PageContainer>
            <Details>
                {selectedPark !== null ? <ParkDetails parkInfo={selectedPark} ></ParkDetails>
                    :
                    <div>You must select a park to host!</div>}
            </Details>

            <FormWrapper className={classes.formControl} onSubmit={handleHostInformation}>
                <SelectDiv>
                    <InputLabel shrink id="Select a sport"> Sport</InputLabel>
                    <SelectTag
                        labelId="Select a sport"
                        id="Sportselection"
                        value={sportSelect}
                        required onChange={(event) => setSportSelect(event.target.value)}>
                        {sports.map(sport => {
                            return (
                                <EachMenuItem value={sport} key={sport}>{sport}</EachMenuItem>
                            )
                        })}
                    </SelectTag>
                </SelectDiv>
                <SelectDiv>
                    <InputLabel shrink id="Select a skill">Skill</InputLabel>
                    <SelectTag
                        labelId="Select a skill"
                        id="Select a skill"
                        value={skillSelect}
                        required onChange={(event) => setSkillSelect(event.target.value)}>
                        {skillLevel.map(skill => {
                            return (
                                <EachMenuItem value={skill} key={skill}>{skill}</EachMenuItem>
                            )
                        })}
                    </SelectTag>
                </SelectDiv>
                <SelectDiv>
                    <InputLabel shrink id="Select duration">Duration</InputLabel>
                    <SelectTag
                        labelId="Select duration"
                        id="duration"
                        value={duration}
                        required onChange={(event) => setDuration(event.target.value)}>
                        <EachMenuItem value={duration}>Duration (hrs)</EachMenuItem>
                        <EachMenuItem value={1}>1</EachMenuItem>
                        <EachMenuItem value={2}>2</EachMenuItem>
                        <EachMenuItem value={3}>3</EachMenuItem>
                    </SelectTag>
                </SelectDiv>
                <SelectDiv>
                    <InputLabel shrink id="GroupName">Group name?</InputLabel>

                    <textarea placeholder="Ex: The Dominators." id="GroupName" onChange={(e) => setGroupName(e.target.value)}></textarea>
                </SelectDiv>

                {/* DATES */}
                <StyledDate>
                    <InputLabel shrink id="date">Game day?</InputLabel>
                    <DatePicker
                        id="date"
                        todayButton="Today"
                        selected={startDate}
                        onChange={handleChange}
                        placeholderText="Click to select a date"
                        minDate={new Date()}
                        minTime={(new Date().setHours(7))}
                        maxTime={(new Date().setHours(21))}
                        showTimeSelect
                        timeIntervals={30}
                        timeCaption="time"
                        dateFormat="MMMM d, yyyy h:mm aa"
                    />
                </StyledDate>
                <Button type='submit' variant="outlined" className={classes.root}>Submit</Button>
            </FormWrapper>
            <StyledMessage>
                {success !== false && <StyledSuccess>{success}</StyledSuccess>}
                {error !== false && <StyledError>{error}</StyledError>}
                {conflictEvent !== null &&
                    <EventDetailsWrapper>
                        <ChangeBooking>Would you like to cancel your booking? If not, pick a different time!</ChangeBooking>
                        {!canceled && <EventDetails canceled={canceled} setCanceled={setCanceled} event={conflictEvent} />}
                    </EventDetailsWrapper>}
            </StyledMessage>
        </PageContainer>
    )
}
export default Host;

const StyledSuccess = styled.div`
font-size: 1.5rem;
color: green;
`
const StyledError = styled.div`
margin: 1rem;
font-size: 1.5rem;
display:flex;
padding: 0.5rem;
justify-content: center;
color: #ff0000;
border: solid 1px #ff0000;
@media (max-width: 768px) { 
font-size: 1rem;
        }
`
const ChangeBooking = styled.div`
font-size: 1.3rem;
text-align: center;
margin-bottom: 1rem;

`

const PageContainer = styled.div`
box-shadow: 0 10px 10px -5px;
width: 80%; 
margin-left: auto; 
margin-right: auto; 
position: relative; 
height: 80rem;   
padding-bottom: 2rem;
    textarea {
        resize: none;
        outline: none;
        height: 2rem;
    }
    @media (max-width: 768px) { 
    font-size: 1rem;
    height: 130rem;      
        }
`
const Details = styled.div`
    width: 90%; 
    margin-left: auto; 
    margin-right: auto; 
    div {
        text-align: center;   
        font-size: 2rem;
    }
`
const StyledDate = styled.div`
input {
    height: 2rem;
    outline: none;
}
label {
    font-family: 'Comfortaa', cursive !important;
}
`
const SelectDiv = styled.div`
height: 5rem;
input {
    height: 2rem;
    outline: none;
}
label {
    font-family: 'Comfortaa', cursive !important;
}
`
const StyledMessage = styled.div`
   width: 90%; 
    margin-left: auto; 
    margin-right: auto; 
`
const EachMenuItem = styled(MenuItem)`
     font-family: 'Comfortaa', cursive !important;
`
const SelectTag = styled(Select)`
     font-family: 'Comfortaa', cursive !important;
     width: 10rem;
`
const FormWrapper = styled.form`
display: flex;
flex-flow:nowrap column;
justify-content: center;
`

const EventDetailsWrapper = styled.div`
height: 2rem;
font-size: 0.5rem;
h1 {
    font-size: 1rem;
}
h2 {
    font-size: 1.1rem;
}
`