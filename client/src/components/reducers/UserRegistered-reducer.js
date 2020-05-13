const intitialState = {
    status: 'idle',
    isLoading: false,
    registeredEvents: null,


};

export default function userRegisteredReducer(state = intitialState, action) {
    switch (action.type) {
        //singup or login success
        case "REQUEST_REGISTERED_USER_EVENTS": {
            return {
                ...state,
                status: 'retrieving...',
                isLoading: true,
            }
        }
        case "RETRIEVE_REGISTERED_USER_EVENTS": {
            return {
                ...state,
                status: 'retrieved...',
                isLoading: false,
                registeredEvents: action.payload,
            }
        }
        case "RETRIEVE_REGISTERED_USER_EVENTS_ERROR": {
            return {
                ...state,
                status: 'error',
                isLoading: false,

            }
        }

        default:
            return state;
    }
}