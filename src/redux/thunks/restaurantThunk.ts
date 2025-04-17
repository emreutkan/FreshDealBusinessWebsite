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
}

export interface UpdateRestaurantPayload extends AddRestaurantPayload {
    restaurantId: string;
}

const createFormData = (payload: AddRestaurantPayload) => {
    const formData = new FormData();
    formData.append('restaurantName', payload.restaurantName);
    formData.append('restaurantDescription', payload.restaurantDescription);
    formData.append('longitude', payload.longitude.toString());
    formData.append('latitude', payload.latitude.toString());
    formData.append('category', payload.category);
    payload.workingDays.forEach((day) => formData.append('workingDays', day));
    formData.append('workingHoursStart', payload.workingHoursStart);
    formData.append('workingHoursEnd', payload.workingHoursEnd);
    formData.append('pickup', payload.pickup.toString());
    formData.append('delivery', payload.delivery.toString());
    if (payload.delivery) {
        formData.append('maxDeliveryDistance', payload.maxDeliveryDistance.toString());
        formData.append('deliveryFee', payload.deliveryFee.toString());
        formData.append('minOrderAmount', payload.minOrderAmount.toString());
    }
    if (payload.image) formData.append('image', payload.image);
    formData.append('restaurantEmail', payload.restaurantEmail);
    formData.append('restaurantPhone', payload.restaurantPhone);
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