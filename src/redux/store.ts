// src/store.ts
import { configureStore } from '@reduxjs/toolkit';
// Import your reducers here
import userReducer from './slices/userSlice';
import restaurantReducer from './slices/restaurantSlice';
import purchaseReducer from './slices/purchaseSlice';

const store = configureStore({
    reducer: {
        user: userReducer, // Add reducers here
        restaurant: restaurantReducer,
        purchases: purchaseReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
