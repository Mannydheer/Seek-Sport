export const loginRequest = () => ({
    type: 'LOGIN_REQUEST',
})
export const loginSuccess = (user) => ({
    type: 'LOGIN_SUCCESS',
    user,

})
export const loginError = (payload) => ({
    type: 'LOGIN_ERROR',
    payload
})
export const logOutUser = () => ({
    type: 'LOGOUT',
})

export const requestRegisteredUserEvents = () => ({
    type: 'REQUEST_REGISTERED_USER_EVENTS',
})
export const retrieveRegisteredUserEvents = (payload) => ({
    type: 'RETRIEVE_REGISTERED_USER_EVENTS',
    payload
})
export const retrieveRegisteredUserEventsError = () => ({
    type: 'RETRIEVE_REGISTERED_USER_EVENTS_ERROR',
})



// -----------LOGIN----------------

// export const loginSuccess = () => ({
//     type: "LOGIN_SUCCESS"
// })
// export const loginFail = () => ({
//     type: "LOGIN_FAIL"
// })

// // -----------REGISTER----------------


// export const registerSuccess = () => ({
//     type: "REGISTER_SUCCESS"
// })
// export const registerFail = () => ({
//     type: "REGISTER_FAIL"
// })


