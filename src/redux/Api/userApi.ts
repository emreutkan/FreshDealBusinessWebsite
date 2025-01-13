import axios from 'axios';
import {API_BASE_URL} from './apiService.ts';
const USER_ENDPOINT = `${API_BASE_URL}/user`;

export const updateUsernameAPI = async (newUsername: string, token: string) => {
    console.log('Sending update username request with newUsername:', newUsername);
    const CHANGE_USERNAME = `${USER_ENDPOINT}/username`;
    const response = await axios.post(CHANGE_USERNAME,
        {username: newUsername},
        {headers: {Authorization: `Bearer ${token}`}}
    );
    console.log('Received update username response:', response.data);
    return response.data;
};

export const updateEmailAPI = async (oldEmail: string, newEmail: string, token: string) => {
    console.log('Sending update email request with oldEmail and newEmail:', oldEmail, newEmail);
    const CHANGE_EMAIL = `${USER_ENDPOINT}/email`;
    const response = await axios.post(CHANGE_EMAIL,
        {old_email: oldEmail, new_email: newEmail},
        {headers: {Authorization: `Bearer ${token}`}}
    );
    console.log('Received update email response:', response.data);
    return response.data;
};

export const updatePasswordAPI = async (oldPassword: string, newPassword: string, token: string) => {
    console.log('Sending update password request with oldPassword and newPassword:', oldPassword, newPassword);
    const CHANGE_PASSWORD = `${USER_ENDPOINT}/password`;
    const response = await axios.post(CHANGE_PASSWORD,
        {old_password: oldPassword, new_password: newPassword},
        {headers: {Authorization: `Bearer ${token}`}}
    );
    console.log('Received update password response:', response.data);
    return response.data;
};

export const getUserDataAPI = async (token: string) => {
    console.log('Fetching user data with token:', token);
    const response = await axios.get(USER_ENDPOINT, {
        headers: {Authorization: `Bearer ${token}`}
    });
    console.log('Received user data response:', response.data);
    return response.data;
};
