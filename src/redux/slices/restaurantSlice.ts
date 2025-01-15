// store/slices/restaurantSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    addRestaurant,
    getRestaurantsOfUserThunk,
    removeRestaurant,
    getRestaurantsInProximityThunk,
} from '../thunks/restaurantThunk';

export interface Restaurant {
    id: string;
    owner_id: number;
    restaurantName: string;
    restaurantDescription: string;
    longitude: number;
    latitude: number;
    category: string;
    workingDays: string[];
    workingHoursStart: string;
    workingHoursEnd: string;
    listings: number;
    rating: number;
    ratingCount: number;
    distance_km: number;
    image_url: string;
    pickup: boolean;
    delivery: boolean;
    maxDeliveryDistance: number;
    deliveryFee: number;
    minOrderAmount: number;
}

interface RestaurantState {
    ownedRestaurants: Restaurant[];
    nearbyRestaurants: Restaurant[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: RestaurantState = {
    ownedRestaurants: [],
    nearbyRestaurants: [],
    status: 'idle',
    error: null,
};

const restaurantSlice = createSlice({
    name: 'restaurant',
    initialState,
    reducers: {
        // You can add synchronous reducers here if needed
    },
    extraReducers: (builder) => {
        // Add Restaurant
        builder.addCase(addRestaurant.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        });
        builder.addCase(addRestaurant.fulfilled, (state, action: PayloadAction<any>) => {
            state.status = 'succeeded';
            if (action.payload.restaurant) {
                state.ownedRestaurants.push(action.payload.restaurant);
            }
        });
        builder.addCase(addRestaurant.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload as string;
        });

        // Fetch Owned Restaurants
        builder.addCase(getRestaurantsOfUserThunk.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        });
        builder.addCase(getRestaurantsOfUserThunk.fulfilled, (state, action: PayloadAction<Restaurant[]>) => {
            state.status = 'succeeded';
            state.ownedRestaurants = action.payload;
        });
        builder.addCase(getRestaurantsOfUserThunk.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload as string;
        });

        // Remove Restaurant
        builder.addCase(removeRestaurant.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        });
        builder.addCase(removeRestaurant.fulfilled, (state, action: PayloadAction<{ restaurantId: string; data: any }>) => {
            state.status = 'succeeded';
            state.ownedRestaurants = state.ownedRestaurants.filter(
                (restaurant) => restaurant.id !== action.payload.restaurantId
            );
        });
        builder.addCase(removeRestaurant.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload as string;
        });

        // Fetch Restaurants by Proximity
        builder.addCase(getRestaurantsInProximityThunk.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        });
        builder.addCase(getRestaurantsInProximityThunk.fulfilled, (state, action: PayloadAction<{ restaurants: Restaurant[] }>) => {
            state.status = 'succeeded';
            state.nearbyRestaurants = action.payload.restaurants;
        });
        builder.addCase(getRestaurantsInProximityThunk.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload as string;
        });
    },
});

export default restaurantSlice.reducer;
