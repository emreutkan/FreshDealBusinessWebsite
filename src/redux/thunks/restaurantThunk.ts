// store/thunks/restaurantThunk.ts
import {createAsyncThunk} from '@reduxjs/toolkit';
import {
    addRestaurantAPI,
    deleteRestaurantAPI,
    getRestaurantAPI,
    getRestaurantsAPI,
    getRestaurantsProximityAPI,
} from '../../Api/apiService.ts';
import {RootState} from '../store';

// Type Definitions
export interface AddRestaurantPayload {
    restaurantName: string;
    restaurantDescription?: string;
    longitude: number;
    latitude: number;
    category: string;
    workingDays: string[];
    workingHoursStart?: string;
    workingHoursEnd?: string;
    listings: number;
    image?: File; // Optional image file
}

export const addRestaurant = createAsyncThunk(
    'restaurant/addRestaurant',
    async (payload: AddRestaurantPayload, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.user.token; // Adjust based on your state structure
            if (!token) {
                console.log('No authentication token');
                return rejectWithValue('No authentication token');
            }
            const formData = new FormData();
            formData.append('restaurantName', payload.restaurantName);
            if (payload.restaurantDescription) formData.append('restaurantDescription', payload.restaurantDescription);
            formData.append('longitude', payload.longitude.toString());
            formData.append('latitude', payload.latitude.toString());
            formData.append('category', payload.category);
            payload.workingDays.forEach(day => formData.append('workingDays', day));
            if (payload.workingHoursStart) formData.append('workingHoursStart', payload.workingHoursStart);
            if (payload.workingHoursEnd) formData.append('workingHoursEnd', payload.workingHoursEnd);
            formData.append('listings', payload.listings.toString());
            if (payload.image) formData.append('image', payload.image);

            return await addRestaurantAPI(formData, token);
        } catch (error) {
            return rejectWithValue('Failed to add restaurant' + {error});
        }
    }
);

export const fetchRestaurant = createAsyncThunk(
    'restaurant/fetchRestaurant',
    async (restaurantId: number, { rejectWithValue }) => {
        try {
            return await getRestaurantAPI(restaurantId);
        } catch (error) {
            return rejectWithValue('Failed to fetch restaurant' + {error});
        }
    }
);

export const fetchOwnedRestaurants = createAsyncThunk(
    'restaurant/fetchOwnedRestaurants',
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.user.token; // Adjust based on your state structure
            if (!token) {
                console.log('No authentication token');
                return rejectWithValue('No authentication token');
            }
            return await getRestaurantsAPI(token);
        } catch (error) {
            return rejectWithValue('Failed to fetch restaurants' + {error});
        }
    }
);

export const removeRestaurant = createAsyncThunk(
    'restaurant/removeRestaurant',
    async (restaurantId: number, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.user.token; // Adjust based on your state structure
            if (!token) {
                console.log('No authentication token');
                return rejectWithValue('No authentication token');
            }
            const data = await deleteRestaurantAPI(restaurantId, token);
            return { restaurantId, data };
        } catch (error) {

            return rejectWithValue('Failed to delete restaurant' + {error});
        }
    }
);

export const fetchRestaurantsProximity = createAsyncThunk(
    'restaurant/fetchRestaurantsProximity',
    async (payload: { latitude: number; longitude: number; radius?: number }, { rejectWithValue }) => {
        try {
            return await getRestaurantsProximityAPI(payload);
        } catch (error) {
            return rejectWithValue('Failed to fetch nearby restaurants' + {error});
        }
    }
);
