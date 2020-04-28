const intitialState = {
    status: 'idle',
    isLoading: false,
    events: null,


};

export default function eventReducer(state = intitialState, action) {
    switch (action.type) {
        //singup or login success
        case "REQUEST_EVENTS": {
            console.log(action)
            return {
                ...state,
                status: 'requesting events...',
                isLoading: true,
            }
        }
        case "RETRIEVE_EVENTS": {
            let bookings = {}
            action.data.forEach(event => {

                let eventArray = []
                if (bookings[event.parkId]) {
                    eventArray = bookings[event.parkId]
                }
                eventArray.push(event)
                bookings = { ...bookings, [event.parkId]: eventArray }
            })

            return {
                ...state,
                status: 'retrieved events.',
                isLoading: false,
                events: bookings
            }
        }
        case "RETRIEVE_EVENTS_ERROR": {
            console.log(action)
            return {
                ...state,
                status: 'Error occured retrieving events.',
                isLoading: false,
                events: null
            }
        }



        default:
            return state;
    }
}