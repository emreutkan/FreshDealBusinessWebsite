// api/apiService.ts
// export const API_BASE_URL = 'https://freshdealapi-fkfaajfaffh4c0ex.uksouth-01.azurewebsites.net/v1';
import {logout} from "../slices/userSlice.ts";

export const API_BASE_URL = 'http://192.168.1.7:8000/v1';
//

export const TOKEN_KEY = 'userToken';

// Helper functions for token management
export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const removeStoredToken = () => localStorage.removeItem(TOKEN_KEY);


export const getAuthHeaders = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        throw new Error('No authentication token found');
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const handleAuthError = (error: any) => {
    if (error.status === 401) {
        // Token expired or invalid
        localStorage.removeItem(TOKEN_KEY);
        // You might want to dispatch logout action here
        window.location.href = '/login'; // Or use your router navigation
    }
    throw error;
};

export const authenticatedApiCall = async (
    url: string,
    options: RequestInit = {},
    dispatch: any
) => {
    try {
        const headers = getAuthHeaders();
        const response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                dispatch(logout());
                throw new Error('Authentication expired');
            }
            throw new Error(await response.text());
        }

        return await response.json();
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
};