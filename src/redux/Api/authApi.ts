import axios from 'axios';
import { API_BASE_URL } from "./apiService.ts";

const LOGIN_API_ENDPOINT = `${API_BASE_URL}/login`;
const REGISTER_API_ENDPOINT = `${API_BASE_URL}/register`;

interface LoginPayload {
    email?: string;
    phone_number?: string;
    password?: string;
    verification_code?: string;
    step?: "send_code" | "verify_code" | "skip_verification";
    login_type?: "email" | "phone_number";
    password_login?: boolean;
}

interface RegisterPayload {
    name_surname: string;
    email?: string;
    phone_number?: string;
    password: string;
}

export const loginUserAPI = async (payload: LoginPayload) => {
    const response = await axios.post(LOGIN_API_ENDPOINT, payload);
    return response.data;
};

export const registerUserAPI = async (userData: RegisterPayload) => {
    const response = await axios.post(REGISTER_API_ENDPOINT, userData);
    return response.data;
};