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
        case "UPDATE_EVENT": {
            console.log(action.event, 'actione vent')
            let stateCopy = { ...state }
            let singleEvent = stateCopy.events[action.event.parkId]

            console.log(singleEvent)
            let indexEvent = singleEvent.find((event, index) => {
                if (event._id === action.event._id) {
                    return index
                }
            })
            console.log(indexEvent)
            stateCopy.events[action.event.parkId][indexEvent] = action.event

            return {
                ...stateCopy
            }
        }



        default:
            return state;
    }
}