import {logout} from "../slices/userSlice.ts";

// export const API_BASE_URL = 'https://freshdealbackend.azurewebsites.net/v1';
export const API_BASE_URL = 'http://192.168.1.6:8000/v1';

export const TOKEN_KEY = 'userToken';

export const getStoredToken = () => {
    try {
        const token = localStorage.getItem(TOKEN_KEY);
        console.log('Getting token from localStorage:', token ? 'Token exists' : 'No token found');
        return token;
    } catch (error) {
        console.error('Error retrieving token from localStorage:', error);
        return null;
    }
};

export const setStoredToken = (token: string) => {
    try {
        localStorage.setItem(TOKEN_KEY, token);
        console.log('Token saved to localStorage successfully');
        console.log(token)
    } catch (error) {
        console.error('Error saving token to localStorage:', error);
    }
};

export const removeStoredToken = () => {
    try {
        localStorage.removeItem(TOKEN_KEY);
        console.log('Token removed from localStorage');
    } catch (error) {
        console.error('Error removing token from localStorage:', error);
    }
};

export const getAuthHeaders = (isFormData: boolean = false) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        throw new Error('No authentication token found');
    }

    return isFormData ? {
        'Authorization': `Bearer ${token}`
    } : {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const authenticatedApiCall = async (
    url: string,
    options: RequestInit = {},
    dispatch: any
) => {
    try {
        const isFormData = options.body instanceof FormData;
        const headers = getAuthHeaders(isFormData);

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
                ...(isFormData ? {} : options.headers)
            }
        });

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