const intitialState = {
    status: 'idle',
    isAuthenticated: false,
    isLoading: false,
    token: null,//get token
    user: null,
    _id: null,


};

export default function userReducer(state = intitialState, action) {
    switch (action.type) {
        //singup or login success
        case "LOGIN_SUCCESS": {
            console.log(action)
            return {
                ...state,
                status: 'authenticated',
                isAuthenticated: true,
                isLoading: false,
                user: action.user.name,
                _id: action.user._id,
                token: action.user.token,
                profileImage: action.user.profileImage

            }
        }
        case "LOGIN_REQUEST": {
            return {
                ...state,
                status: 'authenticating...',
                isLoading: true,
            }
        }
        case "LOGIN_ERROR": {
            return {
                ...state,
                isLoading: false,
                isAuthenticated: false,
                token: null,
                status: action.payload,
            }
        }
        case "LOGOUT": {
            return {
                ...intitialState
            }
        }


        default:
            return state;
    }
}