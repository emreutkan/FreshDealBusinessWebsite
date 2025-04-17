import axios from 'axios';
import {API_BASE_URL} from "./apiService.ts";
const LOGIN_API_ENDPOINT = `${API_BASE_URL}/login`;
const REGISTER_API_ENDPOINT = `${API_BASE_URL}/register`;

export const loginUserAPI = async (payload: {
    email?: string;
    phone_number?: string;
    password?: string;
    verification_code?: string;
    step?: "send_code" | "verify_code" | "skip_verification";
    login_type?: "email" | "phone_number";
    password_login?: boolean;
}) => {
    try {
        const response = await axios.post(LOGIN_API_ENDPOINT, payload);
        return response.data;
    } catch (error: any) {
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('An error occurred during login');
    }
};

export const registerUserAPI = async (userData: {
    name_surname: string;
    email?: string;
    phone_number?: string;
    password: string;
}) => {
    try {
        const response = await axios.post(REGISTER_API_ENDPOINT, userData);
        return response.data;
    } catch (error: any) {
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('An error occurred during registration');
    }
};