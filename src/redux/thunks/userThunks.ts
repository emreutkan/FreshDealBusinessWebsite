import {createAsyncThunk} from '@reduxjs/toolkit';
import {
    getUserDataAPI,
    loginUserAPI,
    registerUserAPI,
    updateEmailAPI,
    updatePasswordAPI,
    updateUsernameAPI,
} from "../../Api/apiService.ts";
import {RootState} from "../store";
import {UserDataResponse} from "../slices/userSlice.ts";


// Login user
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
        {rejectWithValue}
    ) => {
        try {
            return await loginUserAPI(payload);
        } catch (error) {
            return rejectWithValue('Login failed' + {error});
        }
    }
);

// Register user
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
        } catch (error) {
            return rejectWithValue('Registration failed' + {error});
        }
    }
);

// Update username
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
                console.log('No authentication token');
                return rejectWithValue('No authentication token');
            }
            return await updateUsernameAPI(newUsername, token);
        } catch (error) {
            return rejectWithValue('Failed to update username' + {error});
        }
    }
);

// Update email
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
                console.log('No authentication token');
                return rejectWithValue('No authentication token');
            }

            return await updateEmailAPI(oldEmail, newEmail, token);
        } catch (error) {
            return rejectWithValue('Failed to update email' + {error});
        }
    }
);

// Update password
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
                console.log('No authentication token');
                return rejectWithValue('No authentication token');
            }
            return await updatePasswordAPI(oldPassword, newPassword, token);
        } catch (error) {
            return rejectWithValue('Failed to update password' + {error});
        }
    }
);

// Get user data
export const getUserData = createAsyncThunk<
    UserDataResponse,
    { token: string },
    { rejectValue: string }
>(
    'user/getUserData',
    async ({token}, {rejectWithValue}) => {
        try {
            return await getUserDataAPI(token);
        } catch (error) {
            return rejectWithValue('Failed to fetch user data' + {error});
        }
    }
);
