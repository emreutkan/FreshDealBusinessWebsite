import {createAsyncThunk} from '@reduxjs/toolkit';
import {RootState} from "../store";
import {UserDataResponse, setToken} from "../slices/userSlice.ts";
import {loginUserAPI, registerUserAPI} from "../Api/authApi.ts";
import {getUserDataAPI, updateEmailAPI, updatePasswordAPI, updateUsernameAPI} from "../Api/userApi.ts";

export const loginUser = createAsyncThunk(
    'user/loginUser',
    async (
        payload: {
            email?: string;
            phone_number?: string;
            password?: string;
            verification_code?: string;
            step?: "send_code" | "verify_code" | "skip_verification";
            login_type?: "email" | "phone_number";
            password_login?: boolean;
        },
        {dispatch, rejectWithValue}
    ) => {
        try {
            const response = await loginUserAPI(payload);
            if (response.token) {
                // Save token before fetching user data so the thunk can access it
                dispatch(setToken(response.token));
                await dispatch(getUserData());
            }
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return rejectWithValue(errorMessage);
        }
    }
);

export const registerUser = createAsyncThunk(
    'user/registerUser',
    async (
        userData: {
            name_surname: string;
            email?: string;
            phone_number?: string;
            password: string;
            role: string;
        },
        {rejectWithValue}
    ) => {
        try {
            return await registerUserAPI(userData);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateUsername = createAsyncThunk<
    { username: string },
    { newUsername: string },
    { state: RootState; rejectValue: string }
>(
    'user/updateUsername',
    async ({newUsername}, {getState, rejectWithValue, dispatch}) => {
        try {
            const token = getState().user.token;
            if (!token) {
                return rejectWithValue('No authentication token');
            }
            const result = await updateUsernameAPI(newUsername, token);

            // After successful username update, refresh user data to ensure state is in sync
            await dispatch(getUserData());

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return rejectWithValue(errorMessage);
        }
    }
);

export const updateEmail = createAsyncThunk<
    { email: string },
    { oldEmail: string; newEmail: string },
    { state: RootState; rejectValue: string }
>(
    'user/updateEmail',
    async ({oldEmail, newEmail}, {getState, rejectWithValue}) => {
        try {
            const token = getState().user.token;
            if (!token) {
                return rejectWithValue('No authentication token');
            }
            return await updateEmailAPI(oldEmail, newEmail, token);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updatePassword = createAsyncThunk<
    { message: string },
    { oldPassword: string; newPassword: string },
    { state: RootState; rejectValue: string }
>(
    'user/updatePassword',
    async ({oldPassword, newPassword}, {getState, rejectWithValue}) => {
        try {
            const token = getState().user.token;
            if (!token) {
                return rejectWithValue('No authentication token');
            }
            return await updatePasswordAPI(oldPassword, newPassword, token);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const getUserData = createAsyncThunk<
    UserDataResponse,
    void,
    { rejectValue: string; state: RootState }
>('user/getUserData', async (_, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const token = state.user?.token;

        if (!token) {
            return rejectWithValue('No token available');
        }

        // Add your API call to get user data
        const response = await getUserDataAPI(token);

        return await response;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return rejectWithValue(errorMessage);
    }
});
