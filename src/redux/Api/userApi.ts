import axios from 'axios';
import {API_BASE_URL} from './apiService.ts';
const USER_ENDPOINT = `${API_BASE_URL}/user`;

export const updateUsernameAPI = async (newUsername: string, token: string) => {
    const CHANGE_USERNAME = `${USER_ENDPOINT}/username`;
    const response = await axios.put(CHANGE_USERNAME,
        {username: newUsername},
        {headers: {Authorization: `Bearer ${token}`}}
    );
    return response.data;
};

export const updateEmailAPI = async (oldEmail: string, newEmail: string, token: string) => {
    const CHANGE_EMAIL = `${USER_ENDPOINT}/email`;
    const response = await axios.put(CHANGE_EMAIL,
        {old_email: oldEmail, new_email: newEmail},
        {headers: {Authorization: `Bearer ${token}`}}
    );
    return response.data;
};

export const updatePasswordAPI = async (oldPassword: string, newPassword: string, token: string) => {
    const CHANGE_PASSWORD = `${USER_ENDPOINT}/password`;
    const response = await axios.put(CHANGE_PASSWORD,
        {old_password: oldPassword, new_password: newPassword},
        {headers: {Authorization: `Bearer ${token}`}}
    );
    return response.data;
};

export const getUserDataAPI = async (token: string) => {
    const response = await axios.get(USER_ENDPOINT, {
        headers: {Authorization: `Bearer ${token}`}
    });
    return response.data;
};
