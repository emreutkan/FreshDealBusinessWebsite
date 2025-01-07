// src/store.ts
import { configureStore } from '@reduxjs/toolkit';
// Import your reducers here
import userReducer from './slices/userSlice';
import restaurantReducer from './slices/restaurantSlice';

const store = configureStore({
    reducer: {
        user: userReducer, // Add reducers here
        restaurant: restaurantReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
