const intitialState = {
    status: 'idle',
    isLoading: false,
    hosts: null,


};

export default function hostReducer(state = intitialState, action) {
    switch (action.type) {
        //singup or login success
        case "REQUEST_HOSTS": {
            return {
                ...state,
                status: 'requesting hosts...',
                isLoading: true,
            }
        }
        case "RETRIEVE_HOSTS": {
            console.log(action)
            return {
                ...state,
                status: 'retrieved hosts.',
                isLoading: false,
                hosts: action.data
            }
        }
        case "RETRIEVE_HOSTS_ERROR": {
            console.log(action)
            return {
                ...state,
                status: 'Error occured retrieving hosts.',
                isLoading: false,
                hosts: null
            }
        }
        // case "SELECTED_PARK": {
        //     return {
        //         ...state,
        //         selectedPark: action.park

        //     }
        // }


        default:
            return state;
    }
}