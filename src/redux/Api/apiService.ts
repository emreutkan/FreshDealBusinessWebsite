// api/apiService.ts
import { Dispatch } from 'redux';
import { logout } from "../slices/userSlice.ts";

export const API_BASE_URL = 'https://freshdealapi-fkfaajfaffh4c0ex.uksouth-01.azurewebsites.net/v1';
export const TOKEN_KEY = 'userToken';

interface AuthHeaders {
    Authorization: string;
    'Content-Type'?: string;
}

interface ApiResponse<T> {
    data?: T;
    error?: string;
    status: number;
}

interface ApiCallOptions extends RequestInit {
    headers?: HeadersInit;
}

export const getStoredToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);

export const getAuthHeaders = (isFormData = false): AuthHeaders => {
    const token = getStoredToken();
    if (!token) {
        throw new Error('No authentication token found');
    }

    const headers: AuthHeaders = {
        Authorization: `Bearer ${token}`
    };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
};

export const authenticatedApiCall = async <T>(
    url: string,
    options: ApiCallOptions = {},
    dispatch: Dispatch
): Promise<ApiResponse<T>> => {
    try {
        const isFormData = options.body instanceof FormData;
        const headers = getAuthHeaders(isFormData);

        console.log('Request details:', {
            url,
            method: options.method,
            isFormData,
            headers
        });

        const requestInit: RequestInit = {
            ...options,
            headers: new Headers({
                ...headers,
                ...(isFormData ? {} : options.headers || {})
            })
        };

        const response = await fetch(url, requestInit);
        console.log('Response status:', response.status);

        if (!response.ok) {
            if (response.status === 401) {
                dispatch(logout());
                console.error('Authentication expired');
            }

            const errorText = await response.text();
            console.log('Error response:', errorText);

            return {
                error: errorText,
                status: response.status
            };
        }

        const data = await response.json();
        return {
            data: data as T,
            status: response.status
        };

    } catch (error) {
        console.error('API call error:', error);
        return {
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            status: 500
        };
    }
};