import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';

import {
    addListingAPI,
    deleteListingAPI,
    editListingAPI,
    getListingsAPI,
    searchListingsAPI
} from "../Api/listingsApi.ts";
import {AddListingPayload, EditListingPayload, SearchListingParams} from "../../types/listingRelated.ts";

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


export const editListing = createAsyncThunk(
    'listing/editListing',
    async (payload: EditListingPayload, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.user.token;
            if (!token) {
                return rejectWithValue('No authentication token');
            }

            const formData = new FormData();
            if (payload.title) formData.append('title', payload.title);
            if (payload.description !== undefined) formData.append('description', payload.description);
            if (payload.originalPrice) formData.append('original_price', payload.originalPrice.toString());
            if (payload.pickUpPrice) formData.append('pick_up_price', payload.pickUpPrice.toString());
            if (payload.deliveryPrice) formData.append('delivery_price', payload.deliveryPrice.toString());
            if (payload.count) formData.append('count', payload.count.toString());
            if (payload.consumeWithin) formData.append('consume_within', payload.consumeWithin.toString());
            if (payload.image) formData.append('image', payload.image);

            const response = await editListingAPI(payload.listingId, formData, token);
            return response;
        } catch (error) {
            return rejectWithValue(`Failed to edit listing: ${error}`);
        }
    }
);

// Updated deleteListing thunk to match new API structure
export const deleteListing = createAsyncThunk(
    'listing/deleteListing',
    async (listingId: number, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.user.token;
            if (!token) {
                return rejectWithValue('No authentication token');
            }

            await deleteListingAPI(listingId, token);
            return { listingId, success: true };
        } catch (error) {
            return rejectWithValue(`Failed to delete listing: ${error}`);
        }
    }
);

