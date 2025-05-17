import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import {NotificationService} from "../../services/notificationService.ts";
import {setError, setPermission, setSubscribed} from "../slices/NotificationSlice.ts";

export const initializeNotifications = createAsyncThunk(
    'notifications/initialize',
    async (_, { dispatch, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.user.token;

            if (!token) {
                throw new Error('No authentication token');
            }

            const notificationService = NotificationService.getInstance();
            await notificationService.initialize();

            const permission = await notificationService.requestPermission();
            dispatch(setPermission(Notification.permission));

            if (permission) {
                await notificationService.subscribeToPushNotifications(token);
                dispatch(setSubscribed(true));
            }

            dispatch(setError(null));
        } catch (error) {
            dispatch(setError(error instanceof Error ? error.message : 'Failed to initialize notifications'));
            throw error;
        }
    }
);