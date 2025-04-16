import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL, authenticatedApiCall } from "../Api/apiService.ts";

// Types
export interface DeliveryInfo {
    is_delivery: boolean;
    pickup_notes?: string;
    delivery_address?: string;
    delivery_notes?: string;
}

interface PaginationParams {
    page?: number;
    per_page?: number;
}

// Restaurant-related purchase thunks
export const fetchRestaurantPurchases = createAsyncThunk(
    'purchases/fetchByRestaurant',
    async (restaurantId: string, { dispatch, rejectWithValue }) => {
        try {
            const url = `${API_BASE_URL}/restaurant/${restaurantId}/purchases`;
            console.log('GET', url);
            const res = await authenticatedApiCall(url, { method: 'GET' }, dispatch);
            console.log('Restaurant purchases response:', res);
            return res;
        } catch (error) {
            console.error('fetchRestaurantPurchases error:', error);
            return rejectWithValue(error.message);
        }
    }
);

// User-related purchase thunks
export const createPurchaseOrder = createAsyncThunk(
    'purchases/create',
    async (deliveryInfo: DeliveryInfo, { dispatch, rejectWithValue }) => {
        try {
            const url = `${API_BASE_URL}/purchase`;
            console.log('POST', url, deliveryInfo);
            const res = await authenticatedApiCall(
                url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(deliveryInfo)
                },
                dispatch
            );
            console.log('Create purchase order response:', res);
            return res;
        } catch (error) {
            console.error('createPurchaseOrder error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const fetchUserActiveOrders = createAsyncThunk(
    'purchases/fetchActiveOrders',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const url = `${API_BASE_URL}/user/orders/active`;
            console.log('GET', url);
            const res = await authenticatedApiCall(url, { method: 'GET' }, dispatch);
            console.log('User active orders response:', res);
            return res;
        } catch (error) {
            console.error('fetchUserActiveOrders error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const fetchUserPreviousOrders = createAsyncThunk(
    'purchases/fetchPreviousOrders',
    async (params: PaginationParams, { dispatch, rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams({
                page: (params.page || 1).toString(),
                per_page: (params.per_page || 10).toString()
            });
            const url = `${API_BASE_URL}/user/orders/previous?${queryParams}`;
            console.log('GET', url);
            const res = await authenticatedApiCall(url, { method: 'GET' }, dispatch);
            console.log('Previous orders response:', res);
            return res;
        } catch (error) {
            console.error('fetchUserPreviousOrders error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const fetchOrderDetails = createAsyncThunk(
    'purchases/fetchOrderDetails',
    async (purchaseId: number, { dispatch, rejectWithValue }) => {
        try {
            const url = `${API_BASE_URL}/user/orders/${purchaseId}`;
            console.log('GET', url);
            const res = await authenticatedApiCall(url, { method: 'GET' }, dispatch);
            console.log('Order details response:', res);
            return res;
        } catch (error) {
            console.error('fetchOrderDetails error:', error);
            return rejectWithValue(error.message);
        }
    }
);

// Restaurant response thunks
export const handlePurchaseResponse = createAsyncThunk(
    'purchases/respond',
    async (
        { purchaseId, action }: { purchaseId: number; action: 'accept' | 'reject' },
        { dispatch, rejectWithValue }
    ) => {
        try {
            const url = `${API_BASE_URL}/purchase/${purchaseId}/response`;
            const body = JSON.stringify({ action });
            console.log('POST', url, body);
            const res = await authenticatedApiCall(
                url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body
                },
                dispatch
            );
            console.log('Handle purchase response:', res);
            return res;
        } catch (error) {
            console.error('handlePurchaseResponse error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const acceptPurchaseOrder = createAsyncThunk(
    'purchases/accept',
    async (purchaseId: number, { dispatch, rejectWithValue }) => {
        try {
            const url = `${API_BASE_URL}/purchases/${purchaseId}/accept`;
            console.log('POST', url);
            const res = await authenticatedApiCall(url, { method: 'POST' }, dispatch);
            console.log('Accept purchase response:', res);
            return res;
        } catch (error) {
            console.error('acceptPurchaseOrder error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const rejectPurchaseOrder = createAsyncThunk(
    'purchases/reject',
    async (purchaseId: number, { dispatch, rejectWithValue }) => {
        try {
            const url = `${API_BASE_URL}/purchases/${purchaseId}/reject`;
            console.log('POST', url);
            const res = await authenticatedApiCall(url, { method: 'POST' }, dispatch);
            console.log('Reject purchase response:', res);
            return res;
        } catch (error) {
            console.error('rejectPurchaseOrder error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const addCompletionImage = createAsyncThunk(
    'purchases/addImage',
    async (
        { purchaseId, file }: { purchaseId: number; file: File },
        { dispatch, rejectWithValue }
    ) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            console.log('Uploading file for purchase ID:', purchaseId);
            console.log('File details:', {
                name: file.name,
                type: file.type,
                size: file.size
            });

            const url = `${API_BASE_URL}/purchase/${purchaseId}/completion-image`;
            console.log('POST', url);

            const res = await authenticatedApiCall(
                url,
                {
                    method: 'POST',
                    body: formData,
                },
                dispatch
            );
            console.log('Add completion image response:', res);
            return res;
        } catch (error) {
            console.error('addCompletionImage error:', error);
            return rejectWithValue(
                error.message && typeof error.message === 'string'
                    ? JSON.parse(error.message)
                    : 'Failed to upload image'
            );
        }
    }
);
