// api/apiService.ts
import axios from 'axios';

// const API_BASE_URL = 'https://freshdealapi-fkfaajfaffh4c0ex.uksouth-01.azurewebsites.net/v1';

const API_BASE_URL = 'http://192.168.1.3:8181/v1';

const CHANGE_USERNAME = `${API_BASE_URL}/user/changeUsername`;
const CHANGE_PASSWORD = `${API_BASE_URL}/user/changePassword`;
const CHANGE_EMAIL = `${API_BASE_URL}/user/changeUsername`;
const LOGIN_API_ENDPOINT = `${API_BASE_URL}/login`;
const REGISTER_API_ENDPOINT = `${API_BASE_URL}/register`;
const GET_USER_DATA_API_ENDPOINT = `${API_BASE_URL}/user/data`;
const ADD_RESTAURANT_API_ENDPOINT = `${API_BASE_URL}/add_restaurant`;
const GET_RESTAURANT_API_ENDPOINT = `${API_BASE_URL}/get_restaurant`; // Needs restaurant_id appended
const GET_RESTAURANTS_API_ENDPOINT = `${API_BASE_URL}/get_restaurants`;
const DELETE_RESTAURANT_API_ENDPOINT = `${API_BASE_URL}/delete_restaurant`; // Needs restaurant_id appended
const GET_RESTAURANTS_PROXIMITY_API_ENDPOINT = `${API_BASE_URL}/get_restaurants_proximity`;
const GET_UPLOADED_FILE_API_ENDPOINT = `${API_BASE_URL}/uploads`; // Needs filename appended

// Flexible Login API Call
export const loginUserAPI = async (payload: {
    email?: string;
    phone_number?: string;
    password?: string;
    verification_code?: string;
    step?: "send_code" | "verify_code" | "skip_verification";
    login_type?: "email" | "phone_number";
    password_login?: boolean;
}) => {
    console.log('Sending login request with payload:', payload);
    const response = await axios.post(LOGIN_API_ENDPOINT, payload);
    console.log('Received login response:', response.data);
    return response.data;
};

// User Registration API Call
export const registerUserAPI = async (userData: {
    name_surname: string;
    email?: string;
    phone_number?: string;
    password: string;
}) => {
    try {
        console.log('Sending registration request with userData:', userData);
        const response = await axios.post(REGISTER_API_ENDPOINT, userData);
        console.log('Received registration response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error during user registration:', error);
        throw error;
    }
};

export const updateUsernameAPI = async (newUsername: string, token: string) => {
    console.log('Sending update username request with newUsername:', newUsername);
    const response = await axios.post(CHANGE_USERNAME,
        {username: newUsername},
        {headers: {Authorization: `Bearer ${token}`}}
    );
    console.log('Received update username response:', response.data);
    return response.data;
};

export const updateEmailAPI = async (oldEmail: string, newEmail: string, token: string) => {
    console.log('Sending update email request with oldEmail and newEmail:', oldEmail, newEmail);
    const response = await axios.post(CHANGE_EMAIL,
        {old_email: oldEmail, new_email: newEmail},
        {headers: {Authorization: `Bearer ${token}`}}
    );
    console.log('Received update email response:', response.data);
    return response.data;
};

export const updatePasswordAPI = async (oldPassword: string, newPassword: string, token: string) => {
    console.log('Sending update password request with oldPassword and newPassword:', oldPassword, newPassword);
    const response = await axios.post(CHANGE_PASSWORD,
        {old_password: oldPassword, new_password: newPassword},
        {headers: {Authorization: `Bearer ${token}`}}
    );
    console.log('Received update password response:', response.data);
    return response.data;
};

export const getUserDataAPI = async (token: string) => {
    console.log('Fetching user data with token:', token);
    const response = await axios.get(GET_USER_DATA_API_ENDPOINT, {
        headers: {Authorization: `Bearer ${token}`}
    });
    console.log('Received user data response:', response.data);
    return response.data;
};

// Add Restaurant API Call
export const addRestaurantAPI = async (formData: FormData, token: string) => {
    console.log('Sending add restaurant request with formData:', formData);
    const response = await axios.post(ADD_RESTAURANT_API_ENDPOINT, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
        },
    });
    console.log('Received add restaurant response:', response.data);
    return response.data;
};

// Get Single Restaurant API Call
export const getRestaurantAPI = async (restaurantId: number) => {
    console.log('Fetching restaurant with ID:', restaurantId);
    const response = await axios.get(`${GET_RESTAURANT_API_ENDPOINT}/${restaurantId}`);
    console.log('Received get restaurant response:', response.data);
    return response.data;
};

// Get All Owned Restaurants API Call
export const getRestaurantsAPI = async (token: string) => {
    console.log('Fetching all owned restaurants with token:', token);
    const response = await axios.get(GET_RESTAURANTS_API_ENDPOINT, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    console.log('Received get restaurants response:', response.data);
    return response.data;
};

// Delete Restaurant API Call
export const deleteRestaurantAPI = async (restaurantId: number, token: string) => {
    console.log('Sending delete restaurant request for ID:', restaurantId);
    const response = await axios.delete(`${DELETE_RESTAURANT_API_ENDPOINT}/${restaurantId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    console.log('Received delete restaurant response:', response.data);
    return response.data;
};

// Get Restaurants by Proximity API Call
export const getRestaurantsProximityAPI = async (payload: {
    latitude: number;
    longitude: number;
    radius?: number;
}) => {
    console.log('Fetching restaurants by proximity with payload:', payload);
    const response = await axios.post(GET_RESTAURANTS_PROXIMITY_API_ENDPOINT, payload);
    console.log('Received restaurants proximity response:', response.data);
    return response.data;
};

// Get Uploaded File URL
export const getUploadedFileURL = (filename: string) => {
    const url = `${GET_UPLOADED_FILE_API_ENDPOINT}/${filename}`;
    console.log('Generated uploaded file URL:', url);
    return url;
};
