import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import {
    addRestaurantAPI,
    deleteRestaurantAPI,
    getRestaurantsOfUserAPI,
    updateRestaurantAPI
} from '../Api/restaurantApi.ts';

export interface AddRestaurantPayload {
    restaurantName: string;
    restaurantDescription: string;
    longitude: number;
    latitude: number;
    category: string;
    workingDays: string[];
    workingHoursStart: string;
    workingHoursEnd: string;
    image?: File;
    pickup: boolean;
    delivery: boolean;
    maxDeliveryDistance: number;
    deliveryFee: number;
    minOrderAmount: number;
    restaurantEmail: string;
    restaurantPhone: string;
    flash_deals_available?: boolean;
}

export interface UpdateRestaurantPayload extends Partial<AddRestaurantPayload> {
    restaurantId: string;
}

const createFormData = (payload: AddRestaurantPayload | UpdateRestaurantPayload) => {
    const formData = new FormData();

    // Add all properties that exist in the payload to the FormData
    if ('restaurantName' in payload) formData.append('restaurantName', payload.restaurantName);
    if ('restaurantDescription' in payload) formData.append('restaurantDescription', payload.restaurantDescription);
    if ('longitude' in payload) formData.append('longitude', payload.longitude.toString());
    if ('latitude' in payload) formData.append('latitude', payload.latitude.toString());
    if ('category' in payload) formData.append('category', payload.category);
    if ('workingDays' in payload) {
        payload.workingDays.forEach((day) => formData.append('workingDays', day));
    }
    if ('workingHoursStart' in payload) formData.append('workingHoursStart', payload.workingHoursStart);
    if ('workingHoursEnd' in payload) formData.append('workingHoursEnd', payload.workingHoursEnd);
    if ('pickup' in payload) formData.append('pickup', payload.pickup.toString());
    if ('delivery' in payload) formData.append('delivery', payload.delivery.toString());

    if ('delivery' in payload && payload.delivery) {
        if ('maxDeliveryDistance' in payload) formData.append('maxDeliveryDistance', payload.maxDeliveryDistance.toString());
        if ('deliveryFee' in payload) formData.append('deliveryFee', payload.deliveryFee.toString());
        if ('minOrderAmount' in payload) formData.append('minOrderAmount', payload.minOrderAmount.toString());
    }

    if ('image' in payload && payload.image) formData.append('image', payload.image);
    if ('restaurantEmail' in payload) formData.append('restaurantEmail', payload.restaurantEmail);
    if ('restaurantPhone' in payload) formData.append('restaurantPhone', payload.restaurantPhone);
    if ('flash_deals_available' in payload) formData.append('flash_deals_available', payload.flash_deals_available.toString());

    return formData;
};

export const addRestaurant = createAsyncThunk(
    'restaurant/addRestaurant',
    async (payload: AddRestaurantPayload, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.user.token;
            if (!token) {
                return rejectWithValue('No authentication token');
            }
            const formData = createFormData(payload);
            return await addRestaurantAPI(formData, token);
        } catch (error) {
            return rejectWithValue(`Failed to add restaurant: ${error}`);
        }
    }
);

export const updateRestaurant = createAsyncThunk(
    'restaurant/updateRestaurant',
    async (payload: UpdateRestaurantPayload, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.user.token;
            if (!token) {
                return rejectWithValue('No authentication token');
            }
            const formData = createFormData(payload);
            return await updateRestaurantAPI(payload.restaurantId, formData, token);
        } catch (error) {
            return rejectWithValue(`Failed to update restaurant: ${error}`);
        }
    }
);

export const getRestaurantsOfUserThunk = createAsyncThunk(
    'restaurant/fetchOwnedRestaurants',
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.user.token;
            if (!token) {
                return rejectWithValue('No authentication token');
            }
            const response = await getRestaurantsOfUserAPI(token);
            return response;
        } catch (error) {
            return rejectWithValue(`Failed to fetch restaurants: ${error}`);
        }
    }
);

export const removeRestaurant = createAsyncThunk(
    'restaurant/removeRestaurant',
    async (restaurantId: string, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.user.token;
            if (!token) {
                return rejectWithValue('No authentication token');
            }
            const data = await deleteRestaurantAPI(restaurantId, token);
            return { restaurantId, data };
        } catch (error) {
            return rejectWithValue(`Failed to delete restaurant: ${error}`);
        }
    }
);