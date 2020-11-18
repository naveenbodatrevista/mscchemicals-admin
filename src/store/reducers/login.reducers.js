import {LOGIN,LOGOUT} from '../actions/login.actions'

const loginReducers = (state={}, action) => {
    
    switch (action.type) {
        case LOGIN:
            return {
                ...state,
                userObj: action.name,
                login:true
            }
        case LOGOUT:
            return {
                ...state,
                userObj: {},
                login:false
            }
        default:
            return state;
    }
}

export default loginReducers;