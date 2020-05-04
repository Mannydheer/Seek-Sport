import { combineReducers } from 'redux';
import userReducer from './user-reducer';
import authReducer from './auth-reducer';
import parkReducer from './park-reducer';
import hostReducer from './hosting-reducer';
import eventReducer from './event-reducer';
import userRegisteredReducer from './UserRegistered-reducer'



export default combineReducers({
    userReducer,
    parkReducer,
    hostReducer,
    eventReducer,
    userRegisteredReducer,
    authReducer

});
// >>>>>>> master

