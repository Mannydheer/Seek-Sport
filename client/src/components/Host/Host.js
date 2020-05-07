import React, { useState, useEffect } from 'react'
import { PageWrapper } from '../Constants/Constants'
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { selectPark, requestHosts, retrieveHosts, retrieveHostsError } from '../actions/parkActions';
import ParkDetails from '../ParkDetails';
import DatePicker from "react-datepicker";
import { skillLevel, sports } from '../data';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';

//themeprovider to style react-datepicker/
import { ThemeProvider } from "styled-components";








import EventDetails from '../EventDetails';
//geometry


import "react-datepicker/dist/react-datepicker.css";


const useStyles = makeStyles(theme => ({
    root: {
        background: "linear-gradient(15deg, #13547a 0%, #80d0c7 100%)",
        border: 0,
        borderRadius: 3,
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        color: 'white',
        height: 32,

        padding: '0 30px',
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
        display: 'flex'

    }
}));

const validateDateBooking = (startDate) => {

    //Todays day and month.
    let currentDate = new Date().toLocaleDateString().split('/');
    let currentMonth = currentDate[0]
    let currentDay = currentDate[1]
    //booking date.
    let bookingDate = new Date(startDate).toLocaleDateString().split('/');
    let bookingMonth = bookingDate[0]
    let bookingDay = bookingDate[1]
    console.log(bookingMonth, currentMonth, bookingDay, currentDay)
    //compare month and day of booking.
    //year CHECKING NOT DONE.
    //if its any day past today... no problems trying to book.
    //backend will handle conflicts if there are any.
    if (bookingMonth >= currentMonth && bookingDay > currentDay) {
        return true;
    }
    //if its the same day... then check for time.
    else if (bookingMonth === currentMonth && bookingDay === currentDay) {
        //convert everything to minutes for the specific day.
        let currentTime = new Date().getHours() * 60 + new Date().getMinutes();
        let selectedTime = new Date(startDate).getHours() * 60 + new Date(startDate).getMinutes();

        //if the total minutes selected is greater or equal to the current minutes...
        //these means that we are either at the same time or past the time...
        //thne we are allowed to book.
        if (selectedTime >= currentTime) {
            return true;
        }
        //if not.... cannot book
        else {
            return false;
        }
    }
    //if its past the date.
    else return false

}




//-----------------------------------COMPONENT---------------------------------
const Host = () => {

    //for modal class.
    const classes = useStyles();
    const userLoggedIn = useSelector(state => state.userReducer);
    //use this for real.
    const selectedPark = useSelector(state => state.parkReducer.selectedPark);


    //
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
        //add selected park.
        event.preventDefault();
        //reset
        setConflictEvent(null)
        setSuccess(false)


        //---------------------TIME ----------------------------



        let startTime = Math.round(((startDate.getTime() / 1000) / 60))
        let currentTime = Math.round(((new Date().getTime() / 1000) / 60))

        //if selected date < todays day - throw err
        //2nd if selected date ==== todays date => make sure time in minutes
        //3rd if selected date > today date then any time is valid.
        //ONLY IF ALLOW FETCH IS TRUE.

        if (sportSelect !== "Choose sport" &&
            skillSelect !== "Choose skill level" &&
            duration !== "Choose duration" && groupName !== null &&
            selectedPark !== null) {
            //now check if it is the same date first....
            let validDate = validateDateBooking(startDate)
            //if a valid date is chosen.
            console.log(validDate)
            if (validDate) {

                //next check if its the same day...
                let hostingInformation = {
                    name: userLoggedIn.user,
                    userId: userLoggedIn._id,
                    profileImage: userLoggedIn.profileImage,
                    // skillSelected: skillSelect,
                    // sportSelect: sportSelect,
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

                //if token is undefined. will be handled in the back?
                let token = localStorage.getItem('accesstoken')
                //
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
                    console.log(hostResponse)
                    //ADD DISPATCHED?
                    if (hostResponse.status === 200) {

                        setSuccess(hostResponse.message)
                        setError(null)
                    }
                    else if (hostResponse.status === 400) {
                        console.log(hostResponse.message)

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

        console.log('inside use efffect')
        setError(false)
        setConflictEvent(null)
        setCanceled(false)
    }, [canceled])
    //as cleanup for states?




    console.log(groupName, 'GROUPNAME')



    return (

        <PageContainer>
            <Details>
                {selectedPark !== null ? <ParkDetails parkInfo={selectedPark} ></ParkDetails> : <div>Cannot book without selecting a park.</div>}
            </Details>

            <form className={classes.formControl} onSubmit={handleHostInformation}>
                <SelectDiv>
                    <InputLabel shrink id="Select a sport"> Sport</InputLabel>
                    <Select
                        labelId="Select a sport"
                        id="Sportselection"
                        value={sportSelect}
                        required onChange={(event) => setSportSelect(event.target.value)}>
                        {sports.map(sport => {
                            return (
                                <MenuItem value={sport} key={sport}>{sport}</MenuItem>
                            )
                        })}
                    </Select>
                </SelectDiv>
                <SelectDiv>
                    <InputLabel shrink id="Select a skill">Skill</InputLabel>
                    <Select
                        labelId="Select a skill"
                        id="Select a skill"
                        value={skillSelect}
                        required onChange={(event) => setSkillSelect(event.target.value)}>
                        {skillLevel.map(skill => {
                            return (
                                <MenuItem value={skill} key={skill}>{skill}</MenuItem>
                            )
                        })}
                    </Select>
                </SelectDiv>
                <SelectDiv>
                    <InputLabel shrink id="Select duration">Duration</InputLabel>
                    <Select
                        labelId="Select duration"
                        id="duration"
                        value={duration}
                        required onChange={(event) => setDuration(event.target.value)}>
                        <MenuItem value={duration}>Duration (hrs)</MenuItem>
                        <MenuItem value={1}>1</MenuItem>
                        <MenuItem value={2}>2</MenuItem>
                        <MenuItem value={3}>3</MenuItem>
                    </Select>
                </SelectDiv>
                <div>
                    <textarea placeholder="Enter a group name..." id="Group Name" onChange={(e) => setGroupName(e.target.value)}></textarea>
                </div>
                {/* DATES */}
                <StyledDate>
                    <DatePicker

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



            </form>
            <StyledMessage>
                {success !== false && <StyledSuccess>{success}</StyledSuccess>}
                {error !== false && <StyledError>{error}</StyledError>}
                {conflictEvent !== null &&
                    <div>
                        <ChangeBooking>Would you like to cancel your booking? If not, pick a different time!</ChangeBooking>
                        {!canceled && <EventDetails canceled={canceled} setCanceled={setCanceled} event={conflictEvent} />}
                    </div>}
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
font-size: 1.5rem;

color: #ff0000;
`
const ChangeBooking = styled.div`
font-size: 1.3rem;

`

const PageContainer = styled.div`
    width: 80%; 
    margin-left: auto; 
    margin-right: auto; 
    position: relative; 
    height: 100vh;   

    form {
        width: 90%; 
    margin-left: auto; 
    margin-right: auto; 

    }
`
const Details = styled.div`
    width: 90%; 
    margin-left: auto; 
    margin-right: auto; 

`

const StyledDate = styled.div`
`
const SelectDiv = styled.div`
`
const StyledMessage = styled.div`
   width: 90%; 
    margin-left: auto; 
    margin-right: auto; 

`