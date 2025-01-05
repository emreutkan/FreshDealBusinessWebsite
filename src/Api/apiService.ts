//  api/apiService.ts
import axios from 'axios';

const API_BASE_URL = 'https://freshdealapi-fkfaajfaffh4c0ex.uksouth-01.azurewebsites.net/v1';

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
    const response = await axios.post(LOGIN_API_ENDPOINT, payload);
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
        const response = await axios.post(REGISTER_API_ENDPOINT, userData); // Adjust the endpoint
        console.log('Request URL:', axios.getUri({method: 'POST', url: REGISTER_API_ENDPOINT})); // Logs full URL
        return response.data;
    } catch (error) {
        console.error('API Request Error:', {error});
        throw error; // Re-throw error for thunk to handle
    }
};


export const updateUsernameAPI = async (newUsername: string, token: string) => {
    const response = await axios.post(CHANGE_USERNAME,
        {username: newUsername},
        {headers: {Authorization: `Bearer ${token}`}}
    );
    return response.data;
};

export const updateEmailAPI = async (oldEmail: string, newEmail: string, token: string) => {
    const response = await axios.post(CHANGE_EMAIL,
        {old_email: oldEmail, new_email: newEmail},
        {headers: {Authorization: `Bearer ${token}`}}
    );
    return response.data;
};

export const updatePasswordAPI = async (oldPassword: string, newPassword: string, token: string) => {
    const response = await axios.post(CHANGE_PASSWORD,
        {old_password: oldPassword, new_password: newPassword},
        {headers: {Authorization: `Bearer ${token}`}}
    );
    return response.data;
};

export const getUserDataAPI = async (token: string) => {
    const response = await axios.get(GET_USER_DATA_API_ENDPOINT, {
        headers: {Authorization: `Bearer ${token}`}
    });
    return response.data;
}

// Add Restaurant API Call
export const addRestaurantAPI = async (formData: FormData, token: string) => {
    const response = await axios.post(ADD_RESTAURANT_API_ENDPOINT, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
        },
    });
    return response.data;
};

// Get Single Restaurant API Call
export const getRestaurantAPI = async (restaurantId: number) => {
    const response = await axios.get(`${GET_RESTAURANT_API_ENDPOINT}/${restaurantId}`);
    return response.data;
};

// Get All Owned Restaurants API Call
export const getRestaurantsAPI = async (token: string) => {
    const response = await axios.get(GET_RESTAURANTS_API_ENDPOINT, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return response.data;
};

// Delete Restaurant API Call
export const deleteRestaurantAPI = async (restaurantId: number, token: string) => {
    const response = await axios.delete(`${DELETE_RESTAURANT_API_ENDPOINT}/${restaurantId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return response.data;
};

// Get Restaurants by Proximity API Call
export const getRestaurantsProximityAPI = async (payload: {
    latitude: number;
    longitude: number;
    radius?: number;
}) => {
    const response = await axios.post(GET_RESTAURANTS_PROXIMITY_API_ENDPOINT, payload);
    return response.data;
};

// Get Uploaded File URL
export const getUploadedFileURL = (filename: string) => {
    return `${GET_UPLOADED_FILE_API_ENDPOINT}/${filename}`;
};