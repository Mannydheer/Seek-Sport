import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';



const UserActivities = () => {

    const userLoggedIn = useSelector(state => state.userReducer)




    const handleUserActivities = async () => {
        let token = localStorage.getItem('accesstoken')
        try {
            let response = await fetch(`/userActivities/${userLoggedIn._id}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'Authorization': `${token}`
                },
            })
            let eventResponse = await response.json();
            console.log(eventResponse)
            // if (eventResponse.status === 200) {
            // } else {
            // }
        } catch (err) {
            throw err
        }
    }
    handleUserActivities()

    return <div>
        User UserActivities
    </div>
}

export default UserActivities;