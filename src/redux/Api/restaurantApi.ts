import axios from 'axios';
import {API_BASE_URL} from "./apiService.ts";
const RESTAURANT_ENDPOINT = `${API_BASE_URL}/restaurants`;
const GET_UPLOADED_FILE_API_ENDPOINT = `${API_BASE_URL}/uploads`; // Needs filename appended

export const addRestaurantAPI = async (formData: FormData, token: string) => {
    const response = await axios.post(RESTAURANT_ENDPOINT, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getRestaurantsOfUserAPI = async (token: string) => {
    const response = await axios.get(RESTAURANT_ENDPOINT, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return response.data;
};

export const deleteRestaurantAPI = async (restaurantId: string, token: string) => {
    const response = await axios.delete(`${RESTAURANT_ENDPOINT}/${restaurantId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getRestaurantsInProximityAPI = async (payload: {
    latitude: number;
    longitude: number;
    radius?: number;
}) => {
    const RESTAURANT_PROXIMITY_ENDPOINT = `${RESTAURANT_ENDPOINT}/proximity`;
    const response = await axios.post(RESTAURANT_PROXIMITY_ENDPOINT, payload);
    return response.data;
};

export const getUploadedFileURLAPI = (filename: string) => {
    const url = `${GET_UPLOADED_FILE_API_ENDPOINT}/${filename}`;
    return url;
};
