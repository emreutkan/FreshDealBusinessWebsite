import axios from 'axios';
import { API_BASE_URL} from "./apiService.ts";

export const addListingAPI = async (restaurantId: number, formData: FormData, token: string) => {
    const response = await axios.post(
        `${API_BASE_URL}/restaurants/${restaurantId}/listings`,
        formData,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        }
    );
    return response.data;
};

export const getListingsAPI = async (queryParams: URLSearchParams) => {
    const response = await axios.get(`${API_BASE_URL}/listings?${queryParams.toString()}`);
    return response.data;
};

export const searchListingsAPI = async (queryParams: URLSearchParams) => {
    const response = await axios.get(`${API_BASE_URL}/search?${queryParams.toString()}`);
    return response.data;
};

// Add the new edit listing API function
// Edit listing
export const editListingAPI = async (listingId: number, formData: FormData, token: string) => {
    const response = await axios.put(
        `${API_BASE_URL}/listings/${listingId}`,
        formData,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        }
    );
    return response.data;
};

// Delete listing
export const deleteListingAPI = async (listingId: number, token: string) => {
    const response = await axios.delete(
        `${API_BASE_URL}/listings/${listingId}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );


    return response.data;
};