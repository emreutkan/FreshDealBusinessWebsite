import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import axios from 'axios';

import { API_BASE_URL} from "../Api/apiService.ts";

// Type Definitions
export interface AddListingPayload {
    restaurantId: number;
    title: string;
    description?: string;
    originalPrice: number;
    pickUpPrice?: number;
    deliveryPrice?: number;
    count: number;
    consumeWithin: number;
    image: File;
}

export interface SearchListingParams {
    type: 'listing';
    query: string;
    restaurantId: number;
}

// API Functions
const addListingAPI = async (restaurantId: number, formData: FormData, token: string) => {
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

const getListingsAPI = async (queryParams: URLSearchParams) => {
    const response = await axios.get(`${API_BASE_URL}/listings?${queryParams.toString()}`);
    return response.data;
};

const searchListingsAPI = async (queryParams: URLSearchParams) => {
    const response = await axios.get(`${API_BASE_URL}/search?${queryParams.toString()}`);
    return response.data;
};

const deleteListingAPI = async (restaurantId: number, listingId: number, token: string) => {
    const response = await axios.delete(
        `${API_BASE_URL}/restaurants/${restaurantId}/listings/${listingId}`,
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    return response.data;
};

// Thunks
export const addListing = createAsyncThunk(
    'listing/addListing',
    async (payload: AddListingPayload, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.user.token;
            if (!token) {
                return rejectWithValue('No authentication token');
            }

            const formData = new FormData();
            formData.append('title', payload.title);
            formData.append('description', payload.description || '');
            formData.append('original_price', payload.originalPrice.toString());
            if (payload.pickUpPrice) {
                formData.append('pick_up_price', payload.pickUpPrice.toString());
            }
            if (payload.deliveryPrice) {
                formData.append('delivery_price', payload.deliveryPrice.toString());
            }
            formData.append('count', payload.count.toString());
            formData.append('consume_within', payload.consumeWithin.toString());
            formData.append('image', payload.image);

            return await addListingAPI(payload.restaurantId, formData, token);
        } catch (error) {
            return rejectWithValue(`Failed to add listing: ${error}`);
        }
    }
);

export const getListings = createAsyncThunk(
    'listing/getListings',
    async (
        { restaurantId, page = 1, perPage = 10 }: { restaurantId?: number; page?: number; perPage?: number },
        { rejectWithValue }
    ) => {
        try {
            const queryParams = new URLSearchParams();
            if (restaurantId) {
                queryParams.append('restaurant_id', restaurantId.toString());
            }
            queryParams.append('page', page.toString());
            queryParams.append('per_page', perPage.toString());

            return await getListingsAPI(queryParams);
        } catch (error) {
            return rejectWithValue(`Failed to fetch listings: ${error}`);
        }
    }
);

export const searchListings = createAsyncThunk(
    'listing/searchListings',
    async (params: SearchListingParams, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams({
                type: params.type,
                query: params.query,
                restaurant_id: params.restaurantId.toString()
            });

            const response = await searchListingsAPI(queryParams);
            return response;
        } catch (error) {
            return rejectWithValue(`Failed to search listings: ${error}`);
        }
    }
);

export const deleteListing = createAsyncThunk(
    'listing/deleteListing',
    async (
        { restaurantId, listingId }: { restaurantId: number; listingId: number },
        { rejectWithValue, getState }
    ) => {
        try {
            const state = getState() as RootState;
            const token = state.user.token;
            if (!token) {
                return rejectWithValue('No authentication token');
            }

            await deleteListingAPI(restaurantId, listingId, token);
            return { listingId, success: true };
        } catch (error) {
            return rejectWithValue(`Failed to delete listing: ${error}`);
        }
    }
);

// Get user's listings (for restaurant owners)
export const getUserListings = createAsyncThunk(
    'listing/getUserListings',
    async (restaurantId: number, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.user.token;
            if (!token) {
                return rejectWithValue('No authentication token');
            }

            const queryParams = new URLSearchParams({
                restaurant_id: restaurantId.toString(),
                owner_view: 'true'
            });

            const response = await getListingsAPI(queryParams);
            return response;
        } catch (error) {
            return rejectWithValue(`Failed to fetch user's listings: ${error}`);
        }
    }
);