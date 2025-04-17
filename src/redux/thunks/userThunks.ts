import {createAsyncThunk} from '@reduxjs/toolkit';
import {RootState} from "../store";
import {UserDataResponse} from "../slices/userSlice.ts";
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
                await dispatch(getUserData({token: response.token}));
            }
            return await loginUserAPI(payload);
        } catch (error: any) {
            return rejectWithValue(error.message);
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
    async ({newUsername}, {getState, rejectWithValue}) => {
        try {
            const token = getState().user.token;
            if (!token) {
                return rejectWithValue('No authentication token');
            }
            return await updateUsernameAPI(newUsername, token);
        } catch (error: any) {
            return rejectWithValue(error.message);
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
    { token: string },
    { rejectValue: string }
>(
    'user/getUserData',
    async ({ token }, { rejectWithValue }) => {
        try {
            return await getUserDataAPI(token);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);