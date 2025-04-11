import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    getUserData,
    loginUser,
    registerUser,
    updateEmail,
    updatePassword,
    updateUsername
} from "../thunks/userThunks.ts";
import {getStoredToken, setStoredToken, removeStoredToken} from "../Api/apiService.ts";


interface UserState {
    email: string;
    name_surname: string;
    selectedCode: string;
    phoneNumber: string;
    password: string;
    passwordLogin: boolean;
    verificationCode: string;
    step: "send_code" | "verify_code" | "skip_verification";
    login_type: "email" | "phone_number";
    token: string | null;
    loading: boolean;
    error: string | null;
    role: "owner" | "customer" | "";
}

// Ensure token is retrieved from localStorage
const storedToken = getStoredToken();
console.log('Initializing Redux store with token:', storedToken ? 'Token exists' : 'No token found');

const initialState: UserState = {
    email: '',
    name_surname: '',
    phoneNumber: '',
    selectedCode: '+90',
    password: '',
    passwordLogin: false,
    verificationCode: '',
    step: 'send_code',
    login_type: 'email',
    token: storedToken, // Use stored token directly
    loading: false,
    error: null,
    role: '',
};


const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setToken(state, action: PayloadAction<string>) {
            state.token = action.payload;
            setStoredToken(action.payload); // Ensure token is saved to localStorage
            console.log('Token set in Redux and localStorage');
        },
        logout() {
            // Clear token from localStorage
            removeStoredToken();
            console.log('Token removed from localStorage during logout');
            return { ...initialState, token: null }; // Ensure token is null after logout
        },
        setSelectedCode(state, action: PayloadAction<string>) {
            state.selectedCode = action.payload;
        },
        setEmail(state, action: PayloadAction<string>) {
            state.email = action.payload;
            if (!state.phoneNumber && !state.email) {
                state.password = ''; // Clear password when both are empty
            }
        },
        setName(state, action: PayloadAction<string>) {
            state.name_surname = action.payload;
        },
        setPhoneNumber(state, action: PayloadAction<string>) {
            state.phoneNumber = action.payload.replace(/[^0-9]/g, '').slice(0, 15);
            if (!state.phoneNumber && !state.email) {
                state.password = ''; // Clear password when both are empty
            }
        },
        setPassword(state, action: PayloadAction<string>) {
            state.password = action.payload;
        },
        setPasswordLogin(state, action: PayloadAction<boolean>) {
            state.passwordLogin = action.payload;
        },
        setVerificationCode(state, action: PayloadAction<string>) {
            state.verificationCode = action.payload;
        },
        setStep(state, action: PayloadAction<"send_code" | "verify_code" | "skip_verification">) {
            state.step = action.payload;
        },
        setLoginType(state, action: PayloadAction<"email" | "phone_number">) {
            state.login_type = action.payload;
        },

    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                setStoredToken(action.payload.token);
                console.log('Token saved after successful login:', action.payload.token ? 'Token exists' : 'No token');
            })
            .addCase(loginUser.rejected, (state) => {
                state.loading = false;
                state.error = 'Login failed';
            })
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(registerUser.rejected, (state) => {
                state.loading = false;
                state.error = 'Registration failed';
            })
            .addCase(updateUsername.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUsername.fulfilled, (state, action) => {
                state.loading = false;
                state.name_surname = action.payload.username;
            })
            .addCase(updateUsername.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update username';
            })
            .addCase(updateEmail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateEmail.fulfilled, (state, action) => {
                state.loading = false;
                state.email = action.payload.email;
            })
            .addCase(updateEmail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update email';
            })
            .addCase(updatePassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePassword.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updatePassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update password';
            })
            .addCase(getUserData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserData.fulfilled, (state, action) => {
                state.loading = false;
                state.name_surname = action.payload.user_data.name;
                state.email = action.payload.user_data.email;
                state.phoneNumber = action.payload.user_data.phone_number;
                state.role = action.payload.user_data.role;


            })
            .addCase(getUserData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch user data';
            });
    }
});

export interface UserDataResponse {
    user_data: {
        id: number;
        name: string;
        email: string;
        phone_number: string;
        role: "owner" | "customer" | "";
    };
    user_address_list: Array<{
        id: number;
        title: string;
        longitude: number;
        latitude: number;
        street: string;
        neighborhood: string;
        district: string;
        province: string;
        country: string;
        postalCode: number;
        apartmentNo: number;
        doorNo: string;
    }>;
}

export const {
    setEmail,
    setName,
    setPhoneNumber,
    setPassword,
    setPasswordLogin,
    setSelectedCode,
    setVerificationCode,
    setStep,
    setLoginType,
    setToken,
    logout,
} = userSlice.actions;

export default userSlice.reducer;
