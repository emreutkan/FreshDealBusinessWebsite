import axios from 'axios';
import {API_BASE_URL} from "./apiService.ts";
const RESTAURANT_ENDPOINT = `${API_BASE_URL}/restaurants`;
const GET_UPLOADED_FILE_API_ENDPOINT = `${API_BASE_URL}/uploads`; // Needs filename appended

export const addRestaurantAPI = async (formData: FormData, token: string) => {
    console.log('Sending add restaurant request with formData:', formData);
    const response = await axios.post(RESTAURANT_ENDPOINT, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
        },
    });
    console.log('Received add restaurant response:', response.data);
    return response.data;
};

export const getRestaurantsOfUserAPI = async (token: string) => {
    console.log('Fetching all owned restaurants with token:', token);
    const response = await axios.get(RESTAURANT_ENDPOINT, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    console.log('Received get restaurants response:', response.data);
    return response.data;
};

export const deleteRestaurantAPI = async (restaurantId: number, token: string) => {
    console.log('Sending delete restaurant request for ID:', restaurantId);
    const response = await axios.delete(`${RESTAURANT_ENDPOINT}/${restaurantId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    console.log('Received delete restaurant response:', response.data);
    return response.data;
};

export const getRestaurantsInProximityAPI = async (payload: {
    latitude: number;
    longitude: number;
    radius?: number;
}) => {
    console.log('Fetching restaurants by proximity with payload:', payload);
    const RESTAURANT_PROXIMITY_ENDPOINT = `${RESTAURANT_ENDPOINT}/proximity`;
    const response = await axios.post(RESTAURANT_PROXIMITY_ENDPOINT, payload);
    console.log('Received restaurants proximity response:', response.data);
    return response.data;
};

export const getUploadedFileURLAPI = (filename: string) => {
    const url = `${GET_UPLOADED_FILE_API_ENDPOINT}/${filename}`;
    console.log('Generated uploaded file URL:', url);
    return url;
};
