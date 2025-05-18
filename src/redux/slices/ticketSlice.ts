import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from "../Api/apiService.ts";
import axios from 'axios';

export interface Ticket {
    id: number;
    user_id: number;
    user_name?: string;
    purchase_id: number;
    restaurant_id: number;
    restaurant_name?: string;
    listing_id: number | null;
    listing_title?: string;
    description: string;
    image_url: string | null;
    reported_at: string;
    status: string;
    resolved_at?: string | null;
    resolved_by?: number | null;
    punishment_id?: number | null;
}

interface TicketState {
    tickets: Ticket[];
    restaurantTickets: {
        [restaurantId: string]: Ticket[]
    };
    loading: boolean;
    error: string | null;
}

const initialState: TicketState = {
    tickets: [],
    restaurantTickets: {},
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
export const fetchAllTickets = createAsyncThunk(
    'tickets/fetchAll',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { user } = getState() as { user: { token: string } };
            const response = await api.get('/tickets', user.token);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch tickets');
        }
    }
);

export const fetchRestaurantTickets = createAsyncThunk(
    'tickets/fetchRestaurantTickets',
    async (restaurantId: number, { getState, rejectWithValue }) => {
        try {
            const { user } = getState() as { user: { token: string } };
            const response = await api.get(`/tickets/search?restaurant_id=${restaurantId}`, user.token);
            return { restaurantId, data: response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurant tickets');
        }
    }
);

export const disregardTicket = createAsyncThunk(
    'tickets/disregardTicket',
    async (ticketId: number, { getState, rejectWithValue }) => {
        try {
            const { user } = getState() as { user: { token: string } };
            const response = await api.post(`/tickets/${ticketId}/disregard`, {}, user.token);
            return { ...response.data, ticketId };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to disregard ticket');
        }
    }
);

export const searchTickets = createAsyncThunk(
    'tickets/searchTickets',
    async (query: string, { getState, rejectWithValue }) => {
        try {
            const { user } = getState() as { user: { token: string } };
            const response = await api.get(`/tickets/search?query=${encodeURIComponent(query)}`, user.token);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to search tickets');
        }
    }
);

export const punishRestaurant = createAsyncThunk(
    'tickets/punishRestaurant',
    async ({
               restaurantId,
               data,
               reportId
           }: {
        restaurantId: number,
        data: { duration_type: string; reason: string },
        reportId?: number
    }, { getState, rejectWithValue }) => {
        try {
            const { user } = getState() as { user: { token: string } };
            const endpoint = reportId
                ? `/restaurants/${restaurantId}/punish?report_id=${reportId}`
                : `/restaurants/${restaurantId}/punish`;

            const response = await api.post(endpoint, data, user.token);
            return { ...response.data, restaurantId, reportId };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to punish restaurant');
        }
    }
);

export const revertPunishment = createAsyncThunk(
    'tickets/revertPunishment',
    async ({
               punishmentId,
               reason
           }: {
        punishmentId: number,
        reason: string
    }, { getState, rejectWithValue }) => {
        try {
            const { user } = getState() as { user: { token: string } };
            const response = await api.post(`/punishments/${punishmentId}/revert`, { reason }, user.token);
            return { ...response.data, punishmentId };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to revert punishment');
        }
    }
);

const ticketSlice = createSlice({
    name: 'tickets',
    initialState,
    reducers: {
        clearTickets: (state) => {
            state.tickets = [];
            state.restaurantTickets = {};
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchAllTickets
            .addCase(fetchAllTickets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllTickets.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.success) {
                    state.tickets = action.payload.tickets || [];
                } else {
                    state.error = action.payload.message || 'Failed to fetch tickets';
                }
            })
            .addCase(fetchAllTickets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to fetch tickets';
            })

            // fetchRestaurantTickets
            .addCase(fetchRestaurantTickets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRestaurantTickets.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.data.success) {
                    const { restaurantId, data } = action.payload;
                    state.restaurantTickets[restaurantId] = data.tickets || [];
                } else {
                    state.error = action.payload.data.message || 'Failed to fetch restaurant tickets';
                }
            })
            .addCase(fetchRestaurantTickets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to fetch restaurant tickets';
            })

            // disregardTicket
            .addCase(disregardTicket.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(disregardTicket.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.success) {
                    const ticketId = action.payload.ticketId;

                    // Update in the main tickets list
                    state.tickets = state.tickets.map(ticket =>
                        ticket.id === ticketId
                            ? { ...ticket, status: 'REJECTED' }
                            : ticket
                    );

                    // Update in any restaurant-specific lists
                    Object.keys(state.restaurantTickets).forEach(restaurantId => {
                        state.restaurantTickets[restaurantId] = state.restaurantTickets[restaurantId].map(ticket =>
                            ticket.id === ticketId
                                ? { ...ticket, status: 'REJECTED' }
                                : ticket
                        );
                    });
                } else {
                    state.error = action.payload.message || 'Failed to disregard ticket';
                }
            })
            .addCase(disregardTicket.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to disregard ticket';
            })

            // searchTickets
            .addCase(searchTickets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchTickets.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.success) {
                    state.tickets = action.payload.tickets || [];
                } else {
                    state.error = action.payload.message || 'Failed to search tickets';
                }
            })
            .addCase(searchTickets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to search tickets';
            })

            // punishRestaurant
            .addCase(punishRestaurant.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(punishRestaurant.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.success) {
                    // If this punishment was linked to a ticket, update the ticket status
                    const reportId = action.payload.reportId;
                    if (reportId) {
                        // Update in the main tickets list
                        state.tickets = state.tickets.map(ticket =>
                            ticket.id === reportId
                                ? {
                                    ...ticket,
                                    status: 'RESOLVED',
                                    punishment_id: action.payload.punishment_id,
                                    resolved_at: new Date().toISOString()
                                }
                                : ticket
                        );

                        // Update in restaurant-specific lists
                        const restaurantId = action.payload.restaurantId.toString();
                        if (state.restaurantTickets[restaurantId]) {
                            state.restaurantTickets[restaurantId] = state.restaurantTickets[restaurantId].map(ticket =>
                                ticket.id === reportId
                                    ? {
                                        ...ticket,
                                        status: 'RESOLVED',
                                        punishment_id: action.payload.punishment_id,
                                        resolved_at: new Date().toISOString()
                                    }
                                    : ticket
                            );
                        }
                    }
                } else {
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
            });
    },
});

export const { clearTickets } = ticketSlice.actions;
export default ticketSlice.reducer;