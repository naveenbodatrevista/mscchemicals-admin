export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';

export function login(name) {
     
    return { type: LOGIN, name};
}

export function logout(name) {
    return { type: LOGOUT, name };
}