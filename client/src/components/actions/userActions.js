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


