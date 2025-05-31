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
    role: "owner" | "customer" | "support" | ""; // Added "support" role
    lastUserDataFetch: number | null; // Timestamp of last successful fetch
}

// Helper function to store user data in localStorage
const saveUserDataToLocalStorage = (userData: Partial<UserState>) => {
    try {
        const existingData = localStorage.getItem('userData');
        const parsedData = existingData ? JSON.parse(existingData) : {};
        localStorage.setItem('userData', JSON.stringify({
            ...parsedData,
            ...userData,
            lastSaved: Date.now()
        }));
    } catch (e) {
        console.error('Error saving user data to localStorage:', e);
    }
};

// Helper function to get user data from localStorage
const getUserDataFromLocalStorage = () => {
    try {
        const data = localStorage.getItem('userData');
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Error reading user data from localStorage:', e);
        return null;
    }
};

// Get token and saved user data
const storedToken = getStoredToken();
const savedUserData = getUserDataFromLocalStorage();

// Initialize state from localStorage if available
const initialState: UserState = {
    email: savedUserData?.email || '',
    name_surname: savedUserData?.name_surname || '',
    phoneNumber: savedUserData?.phoneNumber || '',
    selectedCode: savedUserData?.selectedCode || '+90',
    password: '',
    passwordLogin: false,
    verificationCode: '',
    step: 'send_code',
    login_type: 'email',
    token: storedToken,
    loading: false,
    error: null,
    role: savedUserData?.role || '',
    lastUserDataFetch: savedUserData?.lastUserDataFetch || null
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setToken(state, action: PayloadAction<string>) {
            state.token = action.payload;
            setStoredToken(action.payload);
        },
        clearUserSession: (state) => {
            state.token = null;
            state.role = '';
            state.loading = false;
            state.error = null;
            // Clear any stored token
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
        },
        logout() {
            removeStoredToken();
            localStorage.removeItem('userData');
            return { ...initialState, token: null, role: '' };
        },
        setSelectedCode(state, action: PayloadAction<string>) {
            state.selectedCode = action.payload;
        },
        setEmail(state, action: PayloadAction<string>) {
            state.email = action.payload;
            if (!state.phoneNumber && !state.email) {
                state.password = '';
            }
        },
        setName(state, action: PayloadAction<string>) {
            state.name_surname = action.payload;
        },
        setPhoneNumber(state, action: PayloadAction<string>) {
            state.phoneNumber = action.payload.replace(/[^0-9]/g, '').slice(0, 15);
            if (!state.phoneNumber && !state.email) {
                state.password = '';
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
        // Add setRole action
        setRole(state, action: PayloadAction<"owner" | "customer" | "support" | "">) {
            state.role = action.payload;
            saveUserDataToLocalStorage({ role: action.payload });
        },
        // Manual action to force-update user data from localStorage in case of issues
        restoreUserDataFromStorage(state) {
            const savedData = getUserDataFromLocalStorage();
            if (savedData) {
                if (savedData.email) state.email = savedData.email;
                if (savedData.name_surname) state.name_surname = savedData.name_surname;
                if (savedData.phoneNumber) state.phoneNumber = savedData.phoneNumber;
                if (savedData.role) state.role = savedData.role;
            }
        }
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

                // Reset role when logging in
                state.role = '';
                saveUserDataToLocalStorage({ role: '' });

                console.log('Login successful, token saved');
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateUsername.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUsername.fulfilled, (state, action) => {
                state.loading = false;
                state.name_surname = action.payload.username;
                saveUserDataToLocalStorage({ name_surname: action.payload.username });
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
                saveUserDataToLocalStorage({ email: action.payload.email });
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
                console.log('getUserData: Fetching user data...');
            })
            .addCase(getUserData.fulfilled, (state, action) => {
                console.log('getUserData fulfilled with payload:', action.payload);
                state.loading = false;

                if (action.payload && action.payload.user_data) {
                    state.name_surname = action.payload.user_data.name;
                    state.email = action.payload.user_data.email;
                    state.phoneNumber = action.payload.user_data.phone_number;
                    state.role = action.payload.user_data.role;
                    state.lastUserDataFetch = Date.now();

                    console.log('Updated user state with role:', action.payload.user_data.role);

                    // Save complete user data to localStorage
                    saveUserDataToLocalStorage({
                        name_surname: action.payload.user_data.name,
                        email: action.payload.user_data.email,
                        phoneNumber: action.payload.user_data.phone_number,
                        role: action.payload.user_data.role,
                        lastUserDataFetch: Date.now()
                    });
                } else {
                    console.warn('getUserData payload missing user_data:', action.payload);
                }
            })
            .addCase(getUserData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch user data';
                console.error('getUserData rejected with error:', action.payload);

                // Try to restore from localStorage as fallback
                const savedData = getUserDataFromLocalStorage();
                if (savedData?.role && !state.role) {
                    console.log('Restoring role from localStorage after API failure');
                    state.role = savedData.role;
                }
            });
    }
});

export interface UserDataResponse {
    user_data: {
        id: number;
        name: string;
        email: string;
        phone_number: string;
        role: "owner" | "customer" | "support" | "";
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
    setRole,
    logout,
    restoreUserDataFromStorage,
    clearUserSession
} = userSlice.actions;

export default userSlice.reducer;