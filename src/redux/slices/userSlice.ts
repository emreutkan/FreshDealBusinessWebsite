import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
    getUserData,
    loginUser,
    registerUser,
    updateEmail,
    updatePassword,
    updateUsername
} from "../thunks/userThunks.ts";

//
// interface UpdateUsernamePayload {
//     newUsername: string;
// }
//
// interface UpdateEmailPayload {
//     oldEmail: string;
//     newEmail: string;
// }
//
// interface UpdatePasswordPayload {
//     oldPassword: string;
//     newPassword: string;
// }

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
    role: "owner";
}

export interface UserDataResponse {
    user_data: {
        id: number;
        name: string;
        email: string;
        phone_number: string;
        role: string;
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
    token: null,
    loading: false,
    error: null,
    role: "owner",
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
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
        setToken(state, action: PayloadAction<string>) {
            state.token = action.payload;
        },
        logout() {
            return {...initialState};
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
                state.role = action.payload.role;
            })
            .addCase(loginUser.rejected, (state) => {
                state.loading = false;
                // state.error = action.payload || 'Login failed';
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
                // state.error = action.payload || 'Registration failed';
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
            })
            .addCase(getUserData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch user data';
            });
    }
});

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
