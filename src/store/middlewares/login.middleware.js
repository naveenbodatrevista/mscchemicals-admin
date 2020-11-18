import { LOGIN, LOGOUT } from '../actions/login.actions';
import axios from 'axios';
export const updateInterceptor = (state, type) => {

    if(type===LOGIN){
        axios.interceptors.request.use(config=>{
           
             config.headers.Authorization='Bearer '+state.login.userObj.token;
             return config;
         });
    }else if(type===LOGOUT){
        axios.interceptors.request.use(config=>{
            config.headers.Authorization='Bearer ';
            return config;
        });
        
    }
    
}

const login = store => next => action => {
    let result = next(action)
    
        updateInterceptor(store.getState(),action.type)
     
    return result
}


export default login;