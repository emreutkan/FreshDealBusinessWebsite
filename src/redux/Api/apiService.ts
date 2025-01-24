// api/apiService.ts
// export const API_BASE_URL = 'https://freshdealapi-fkfaajfaffh4c0ex.uksouth-01.azurewebsites.net/v1';
import {logout} from "../slices/userSlice.ts";

export const API_BASE_URL = 'http://192.168.1.3:8000/v1';
//

export const TOKEN_KEY = 'userToken';

// Helper functions for token management
export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const removeStoredToken = () => localStorage.removeItem(TOKEN_KEY);


export const getAuthHeaders = (isFormData: boolean = false) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        throw new Error('No authentication token found');
    }

    // Don't include Content-Type for FormData
    return isFormData ? {
        'Authorization': `Bearer ${token}`
    } : {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const handleAuthError = (error: any) => {
    if (error.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = '/login';
    }
    throw error;
};

// apiService.ts
export const authenticatedApiCall = async (
    url: string,
    options: RequestInit = {},
    dispatch: any
) => {
    try {
        // Check if the request body is FormData
        const isFormData = options.body instanceof FormData;
        const headers = getAuthHeaders(isFormData);

        // Debug log the request
        console.log('Request details:', {
            url,
            method: options.method,
            isFormData,
            headers
        });

        const response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...(isFormData ? {} : options.headers) // Only add additional headers if not FormData
            }
        });

        // Debug log the response
        console.log('Response status:', response.status);

        if (!response.ok) {
            if (response.status === 401) {
                dispatch(logout());
                throw new Error('Authentication expired');
            }

            const errorText = await response.text();
            console.log('Error response:', errorText);

            throw new Error(errorText);
        }

        return await response.json();
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
};