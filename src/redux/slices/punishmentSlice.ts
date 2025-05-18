import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from "../Api/apiService.ts";
import axios from 'axios';

export interface Punishment {
    id: number;
    restaurant_id: number;
    type: string; // 'TEMPORARY' or 'PERMANENT'
    duration_days: number | null;
    start_date: string;
    end_date: string | null;
    reason: string;
    is_active: boolean;
    is_reverted: boolean;
    created_by: {
        id: number;
        name: string;
    };
    created_at: string;
    reverted_info?: {
        reverted_by: {
            id: number;
            name: string;
        },
        reverted_at: string;
        reason: string;
    };
}

interface RestaurantStatus {
    is_active: boolean;
    punishment?: {
        punishment_id: number;
        type: string;
        start_date: string;
        end_date: string | null;
        reason: string;
    } | null;
}

interface PunishmentState {
    history: {
        [restaurantId: string]: Punishment[]
    };
    restaurantStatus: {
        [restaurantId: string]: RestaurantStatus
    };
    loading: boolean;
    error: string | null;
}

const initialState: PunishmentState = {
    history: {},
    restaurantStatus: {},
    loading: false,
    error: null,
};

// Helper function for API calls
const api = {
    get: async (endpoint: string, token: string) => {
        return axios.get(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
    },
    post: async (endpoint: string, data: any = {}, token: string) => {
        return axios.post(`${API_BASE_URL}${endpoint}`, data, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }
};

// Async thunks
export const fetchPunishmentHistory = createAsyncThunk(
    'punishment/fetchHistory',
    async (restaurantId: number, { getState, rejectWithValue }) => {
        try {
            const { user } = getState() as { user: { token: string } };
            // Updated to match the exact endpoint in your Flask backend
            const response = await api.get(`/restaurants/${restaurantId}/punishment-history`, user.token);
            return { restaurantId, data: response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch punishment history');
        }
    }
);

export const fetchRestaurantStatus = createAsyncThunk(
    'punishment/fetchStatus',
    async (restaurantId: number, { getState, rejectWithValue }) => {
        try {
            const { user } = getState() as { user: { token: string } };
            // This endpoint doesn't require JWT according to your backend code
            const response = await axios.get(`${API_BASE_URL}/restaurants/${restaurantId}/status`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            return { restaurantId, data: response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurant status');
        }
    }
);

export const punishRestaurant = createAsyncThunk(
    'punishment/punishRestaurant',
    async ({
               restaurantId,
               data,
               reportId
           }: {
        restaurantId: number,
        data: { duration_type: string; reason: string, report_id?: number },
        reportId?: number
    }, { getState, rejectWithValue, dispatch }) => {
        try {
            const { user } = getState() as { user: { token: string } };

            // Add report_id to data if provided
            if (reportId) {
                data.report_id = reportId;
            }

            const response = await api.post(`/restaurants/${restaurantId}/punish`, data, user.token);

            // Refresh the punishment history and status after successful punishment
            if (response.data.success) {
                dispatch(fetchPunishmentHistory(restaurantId));
                dispatch(fetchRestaurantStatus(restaurantId));
            }

            return { ...response.data, restaurantId };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to punish restaurant');
        }
    }
);

export const revertPunishment = createAsyncThunk(
    'punishment/revertPunishment',
    async ({
               punishmentId,
               restaurantId,
               reason
           }: {
        punishmentId: number,
        restaurantId: number,
        reason: string
    }, { getState, rejectWithValue, dispatch }) => {
        try {
            const { user } = getState() as { user: { token: string } };
            // Matches your backend endpoint
            const response = await api.post(`/punishments/${punishmentId}/revert`, { reason }, user.token);

            // Refresh the punishment history and status after successful reversion
            if (response.data.success) {
                dispatch(fetchPunishmentHistory(restaurantId));
                dispatch(fetchRestaurantStatus(restaurantId));
            }

            return { ...response.data, punishmentId, restaurantId };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to revert punishment');
        }
    }
);

export const issueRefund = createAsyncThunk(
    'punishment/issueRefund',
    async ({
               orderId,
               data
           }: {
        orderId: number,
        data: { amount: number; reason: string }
    }, { getState, rejectWithValue }) => {
        try {
            const { user } = getState() as { user: { token: string } };
            // Matches your backend endpoint for issuing refunds
            const response = await api.post(`/orders/${orderId}/refund`, data, user.token);
            return { ...response.data, orderId };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to issue refund');
        }
    }
);

const punishmentSlice = createSlice({
    name: 'punishment',
    initialState,
    reducers: {
        clearPunishmentData: (state) => {
            state.history = {};
            state.restaurantStatus = {};
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchPunishmentHistory
            .addCase(fetchPunishmentHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPunishmentHistory.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.data.success) {
                    const { restaurantId, data } = action.payload;
                    // Updated to match backend response format - punishment_history field
                    state.history[restaurantId] = data.punishment_history || [];
                } else {
                    state.error = action.payload.data.message || 'Failed to fetch punishment history';
                }
            })
            .addCase(fetchPunishmentHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to fetch punishment history';
            })

            // fetchRestaurantStatus
            .addCase(fetchRestaurantStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRestaurantStatus.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.data.success) {
                    const { restaurantId, data } = action.payload;
                    state.restaurantStatus[restaurantId] = {
                        is_active: data.is_active,
                        punishment: data.punishment
                    };
                } else {
                    state.error = action.payload.data.message || 'Failed to fetch restaurant status';
                }
            })
            .addCase(fetchRestaurantStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to fetch restaurant status';
            })

            // punishRestaurant
            .addCase(punishRestaurant.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(punishRestaurant.fulfilled, (state, action) => {
                state.loading = false;
                if (!action.payload.success) {
                    state.error = action.payload.message || 'Failed to punish restaurant';
                }
            })
            .addCase(punishRestaurant.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to punish restaurant';
            })

            // revertPunishment
            .addCase(revertPunishment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(revertPunishment.fulfilled, (state, action) => {
                state.loading = false;
                if (!action.payload.success) {
                    state.error = action.payload.message || 'Failed to revert punishment';
                }
            })
            .addCase(revertPunishment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to revert punishment';
            })

            // issueRefund
            .addCase(issueRefund.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(issueRefund.fulfilled, (state, action) => {
                state.loading = false;
                if (!action.payload.success) {
                    state.error = action.payload.message || 'Failed to issue refund';
                }
            })
            .addCase(issueRefund.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to issue refund';
            });
    },
});

export const { clearPunishmentData } = punishmentSlice.actions;
export default punishmentSlice.reducer;