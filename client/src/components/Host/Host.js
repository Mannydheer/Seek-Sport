import React, { useState } from 'react'
import { PageWrapper } from '../Constants/Constants'
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { selectPark, requestHosts, retrieveHosts, retrieveHostsError } from '../actions/parkActions';
import ParkDetails from '../ParkDetails';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";


//DATA
const sports = [
    "Choose sport",
    "Soccer",
    "Tennis",
    "Basket-Ball",
    "Badminton",
    "Hockey",
    "Dodgeball",
    "Volleyball",
];

const skillLevel = [
    "Choose skill level",
    "Beginner",
    "Intermediate",
    "Advanced"

];





const Host = () => {



    const userLoggedIn = useSelector(state => state.userReducer);
    //use this for real.
    const selectedPark = useSelector(state => state.parkReducer.selectedPark);


    //
    const [sportSelect, setSportSelect] = useState("Choose sport");
    const [skillSelect, setSkillSelect] = useState("Choose skill level");
    const [duration, setDuration] = useState(1);
    const [success, setSuccess] = useState(false);
    const [startDate, setStartDate] = useState(new Date())

    const handleHostInformation = async (event) => {
        //add selected park.
        event.preventDefault();
        //---------------------TIME ----------------------------
        let d = new Date();
        let currentMinutes = d.getHours() * 60 + d.getMinutes()
        let startMinutes = startDate.getHours() * 60 + startDate.getMinutes()

        //ONLY IF ALLOW FETCH IS TRUE.
        if (sportSelect !== "Choose sport" &&
            skillSelect !== "Choose skill level" &&
            selectedPark !== null &&
            //make sure the time is past the actual current time.
            startDate.getTime() > new Date().getTime()) {

            console.log(startDate.getTime(), new Date().getTime())


            let hostingInformation = {
                name: userLoggedIn.user,
                userId: userLoggedIn._id
            }

            let eventInformation = {
                name: userLoggedIn.user,
                //whoever is currently logged in.
                userId: userLoggedIn._id,
                sport: sportSelect,
                skill: skillSelect,
                //replace witht he actual park. 
                parkId: selectedPark.id,
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
                }
                else if (hostResponse.status === 400) {
                    console.log(hostResponse.message)
                    setSuccess(hostResponse.message)
                }
            }
            catch (err) {
                console.log(err, "catch error inside handleHosting in Host component.")
            }
        }
        //if any of the cases fail. 
        else {
            setSuccess('Invalid time booking.')
        }
    }

    const handleChange = (date) => {
        console.log(date)
        setStartDate(date)
    };

    return (

        <PageWrapper>
            {selectedPark !== null ? <ParkDetails parkInfo={selectedPark} ></ParkDetails> : <div>Cannot book without selecting a park.</div>}


            <form onSubmit={handleHostInformation}>
                <select required onChange={(event) => setSportSelect(event.target.value)}>
                    {sports.map(sport => {
                        return (
                            <option key={sport}>{sport}</option>
                        )
                    })}
                </select>
                <select required onChange={(event) => setSkillSelect(event.target.value)}>
                    {skillLevel.map(skill => {
                        return (
                            <option key={skill}>{skill}</option>
                        )
                    })}
                </select>


                <DatePicker
                    todayButton="Today"
                    selected={startDate}
                    onChange={handleChange}
                    placeholderText="Click to select a date"
                    minDate={new Date()}
                    minTime={(new Date().setHours(7))}
                    maxTime={(new Date().setHours(22))}
                    showTimeSelect
                    timeIntervals={15}
                    timeCaption="time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                />
                <select required onChange={(event) => setDuration(event.target.value)}>
                    <option>Duration (hrs)</option>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                </select>
                <button type='submit'>Submit</button>
                {success !== false && <div>{success}</div>}


            </form>


        </PageWrapper>
    )

}

export default Host;


// const parkInfo =
// {
//     business_status: 'OPERATIONAL',
//     formatted_address: 'Rue Fleury O, Montréal, QC H3L 1B9, Canada',
//     geometry: {
//         location: {
//             lat: 45.5440696,
//             lng: -73.6655919
//         },
//         viewport: {
//             northeast: {
//                 lat: 45.54563832989272,
//                 lng: -73.66410922010726
//             },
//             southwest: {
//                 lat: 45.54293867010728,
//                 lng: -73.66680887989271
//             }
//         }
//     },
//     icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/generic_recreational-71.png',
//     id: '0954f1fa71a785bbbdc1fce14df48647a9ea5d57',
//     name: 'Parc Tolhurst',
//     opening_hours: {
//         open_now: true
//     },
//     photos: [
//         {
//             height: 3456,
//             html_attributions: [
//                 '<a href="https://maps.google.com/maps/contrib/101021804328762220817">paul rossini</a>'
//             ],
//             photo_reference: 'CmRaAAAAdbfA3pze3_YBS_dpMcBOEopwoHWrSodO-2-fP9-FYJ7KCBcpKhgu7U3T90mz_8W6rFxrFKy0VI9N31LcxlAuN4UakpvJ4pAunHcd_24hpWwlRt2NAqQxfyYRIBpr7w8HEhAi9cdyOZB7i89zi3sfC6BmGhTDUSvzr4pYleLWaKaLxXi8SHz_oA',
//             width: 4608
//         }
//     ],
//     place_id: 'ChIJwUGDhpMYyUwRMCTSeBh8Z8E',
//     plus_code: {
//         compound_code: 'G8VM+JQ Montreal, Quebec',
//         global_code: '87Q8G8VM+JQ'
//     },
//     rating: 4.3,
//     reference: 'ChIJwUGDhpMYyUwRMCTSeBh8Z8E',
//     types: [
//         'park',
//         'point_of_interest',
//         'establishment'
//     ],
//     user_ratings_total: 143
// }
