import { createStore } from 'redux';

import reducer from './reducers';
import { Typography } from '@material-ui/core';



const loadFromLocalStorage = () => {
    console.log('inside loadfom local')
    try {
        const serializedState = localStorage.getItem('state')
        //if nothing in local storage, return undefined...
        if (serializedState === null) return undefined
        return JSON.parse(serializedState)

    } catch (e) {
        console.log(e)
        return undefined
    }
}
const persistedState = loadFromLocalStorage();


export default function configureStore(initialState) {
    const store = createStore(

        reducer,
        persistedState,
        initialState,


        window.__REDUX_DEVTOOLS_EXTENSION__
        && window.__REDUX_DEVTOOLS_EXTENSION__()


    );
    return store;
}
