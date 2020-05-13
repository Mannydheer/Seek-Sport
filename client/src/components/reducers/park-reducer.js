const intitialState = {
    status: 'idle',
    // isAuthenticated: false,
    isLoading: false,
    parks: null,
    selectedPark: null

};

export default function parkReducer(state = intitialState, action) {
    switch (action.type) {
        //singup or login success
        case "REQUEST_PARKS": {
            return {
                ...state,
                status: 'requesting parks...',
                isLoading: true,
            }
        }
        case "RETRIEVE_PARKS": {
            return {
                ...state,
                status: 'retrieved parks.',
                isLoading: false,
                parks: action.data
            }
        }
        case "RETRIEVE_PARKS_ERROR": {
            return {
                ...state,
                status: 'Error occured',
                isLoading: false,
                parks: null
            }
        }
        case "SELECTED_PARK": {
            return {
                ...state,
                selectedPark: action.park

            }
        }


        default:
            return state;
    }
}