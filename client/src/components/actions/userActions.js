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



// -----------chat---------------


export const requestChats = () => ({
    type: 'REQUEST_CHAT',
})
export const retrieveChats = (payload) => ({
    type: 'RETRIEVE_CHAT',
    payload
})
export const retrieveChatsError = () => ({
    type: 'RETRIEVE_CHAT_ERROR',
})
export const addMessage = (message) => ({
    type: 'ADD_MESSAGE',
    message
})
export const leaveRoom = (data) => ({
    type: 'LEAVE_ROOM',
    data
})
export const addChatParticipants = (data) => ({
    type: 'ADD_CHAT_PARTICIPANTS',
    data
})
export const removeChatParticipants = (data) => ({
    type: 'REMOVE_CHAT_PARTICIPANTS',
    data
})
