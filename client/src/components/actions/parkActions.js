export const requestParks = () => ({
    type: 'REQUEST_PARKS',
})
export const retrieveParks = (data) => ({
    type: 'RETRIEVE_PARKS',
    data
})
export const retrieveParksError = () => ({
    type: 'RETRIEVE_PARKS_ERROR',
})

export const selectPark = (park) => ({
    type: 'SELECTED_PARK',
    park
})



//HOSTS
export const retrieveHosts = (data) => ({
    type: 'RETRIEVE_HOSTS',
    data
})
export const retrieveHostsError = () => ({
    type: 'RETRIEVE_HOSTS_ERROR',
})

export const requestHosts = () => ({
    type: 'REQUEST_HOSTS',

})


//EVENT 
//HOSTS
export const retrieveEvents = (data) => ({
    type: 'RETRIEVE_EVENTS',
    data
})
export const retrieveEventsError = () => ({
    type: 'RETRIEVE_EVENTS_ERROR',
})

export const requestEvents = () => ({
    type: 'REQUEST_EVENTS',

})





