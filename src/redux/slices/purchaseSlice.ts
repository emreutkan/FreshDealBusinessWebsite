import { createSlice } from '@reduxjs/toolkit';
import {
    acceptPurchaseOrder,
    addCompletionImage,
    createPurchaseOrder,
    fetchRestaurantPurchases,
    handlePurchaseResponse,
    rejectPurchaseOrder,
    fetchUserActiveOrders,
    fetchUserPreviousOrders,
    fetchOrderDetails
} from '../thunks/purchaseThunks.ts';

export interface Restaurant {
    id: number;
    restaurantName: string;
    image_url?: string;
}

export interface Purchase {
    purchase_id: number;
    purchase_date: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
    quantity: number;
    total_price: string;
    completion_image_url?: string;
    user_id: number;
    restaurant_id: number;
    listing_id: number;
    listing_title: string;
    is_delivery: boolean;
    delivery_address?: string;
    delivery_notes?: string;
    restaurant?: Restaurant;
}

interface PaginationMetadata {
    current_page: number;
    total_pages: number;
    per_page: number;
    total_orders: number;
    has_next: boolean;
    has_prev: boolean;
}

interface PurchaseState {
    items: Purchase[];
    activeOrders: Purchase[];
    previousOrders: Purchase[];
    selectedOrder: Purchase | null;
    pagination: PaginationMetadata | null;
    loading: boolean;
    error: string | null;
}

const initialState: PurchaseState = {
    items: [],
    activeOrders: [],
    previousOrders: [],
    selectedOrder: null,
    pagination: null,
    loading: false,
    error: null
};

const purchaseSlice = createSlice({
    name: 'purchases',
    initialState,
    reducers: {
        clearSelectedOrder: (state) => {
            state.selectedOrder = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createPurchaseOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPurchaseOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.items.push(...action.payload.purchases);
                state.activeOrders.push(...action.payload.purchases);
            })
            .addCase(createPurchaseOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create purchase';
            })

            // Fetch restaurant purchases
            .addCase(fetchRestaurantPurchases.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRestaurantPurchases.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.purchases;
            })
            .addCase(fetchRestaurantPurchases.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch purchases';
            })

            // Fetch user active orders
            .addCase(fetchUserActiveOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserActiveOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.activeOrders = action.payload.active_orders;
            })
            .addCase(fetchUserActiveOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch active orders';
            })

            // Fetch user previous orders
            .addCase(fetchUserPreviousOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserPreviousOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.previousOrders = action.payload.orders;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchUserPreviousOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch previous orders';
            })

            // Fetch order details
            .addCase(fetchOrderDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedOrder = action.payload.order;
            })
            .addCase(fetchOrderDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch order details';
            })

            // Handle purchase response (accept/reject)
            .addCase(handlePurchaseResponse.fulfilled, (state, action) => {
                const updatePurchaseStatus = (purchases: Purchase[]) => {
                    const index = purchases.findIndex(p => p.id === action.payload.purchase.id);
                    if (index !== -1) {
                        purchases[index] = action.payload.purchase;
                    }
                };

                updatePurchaseStatus(state.items);
                updatePurchaseStatus(state.activeOrders);
            })

            // Accept purchase
            .addCase(acceptPurchaseOrder.fulfilled, (state, action) => {
                const updatePurchaseStatus = (purchases: Purchase[]) => {
                    const index = purchases.findIndex(p => p.id === action.payload.purchase.id);
                    if (index !== -1) {
                        purchases[index] = action.payload.purchase;
                    }
                };

                updatePurchaseStatus(state.items);
                updatePurchaseStatus(state.activeOrders);
            })

            // Reject purchase
            .addCase(rejectPurchaseOrder.fulfilled, (state, action) => {
                const updatePurchaseStatus = (purchases: Purchase[]) => {
                    const index = purchases.findIndex(p => p.id === action.payload.purchase.id);
                    if (index !== -1) {
                        purchases[index] = action.payload.purchase;
                    }
                };

                updatePurchaseStatus(state.items);
                const activeOrderIndex = state.activeOrders.findIndex(p => p.id === action.payload.purchase.id);
                if (activeOrderIndex !== -1) {
                    state.activeOrders.splice(activeOrderIndex, 1);
                    state.previousOrders.unshift(action.payload.purchase);
                }
            })

            // Add completion image
            .addCase(addCompletionImage.fulfilled, (state, action) => {
                const updatePurchaseWithImage = (purchases: Purchase[]) => {
                    const index = purchases.findIndex(p => p.id === action.payload.purchase.id);
                    if (index !== -1) {
                        purchases[index] = {
                            ...purchases[index],
                            status: 'COMPLETED',
                            completion_image_url: action.payload.purchase.completion_image_url
                        };
                    }
                };

                updatePurchaseWithImage(state.items);
                updatePurchaseWithImage(state.activeOrders);
                if (state.selectedOrder?.id === action.payload.purchase.id) {
                    state.selectedOrder = action.payload.purchase;
                }
            });
    }
});

export const { clearSelectedOrder, clearError } = purchaseSlice.actions;
export default purchaseSlice.reducer;