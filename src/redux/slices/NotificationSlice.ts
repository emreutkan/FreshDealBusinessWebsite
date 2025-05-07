import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface NotificationsState {
    isSubscribed: boolean;
    permission: NotificationPermission;
    error: string | null;
}

const initialState: NotificationsState = {
    isSubscribed: false,
    permission: 'default',
    error: null
};

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        setSubscribed: (state, action: PayloadAction<boolean>) => {
            state.isSubscribed = action.payload;
        },
        setPermission: (state, action: PayloadAction<NotificationPermission>) => {
            state.permission = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        }
    }
});

export const { setSubscribed, setPermission, setError } = notificationsSlice.actions;

export const selectNotifications = (state: RootState) => state.notifications;

export default notificationsSlice.reducer;