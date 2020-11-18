import { combineReducers } from 'redux';

import settingsReducer from './settings.reducer.js';
import themesReducer from './themes.reducers.js';
import loginReducer from './login.reducers.js';

export default combineReducers({
    settings: settingsReducer,
    theme: themesReducer,
    login: loginReducer
});
