import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { getUserData } from '../redux/thunks/userThunks';

// Simple debounce utility
const useDebounce = (callback: Function, delay: number) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    return (...args: any[]) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    };
};

interface AuthMiddlewareProps {
    children: React.ReactNode;
}

const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({ children }) => {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.user);
    const { token, role, loading, error } = user;
    const [hasAttempted, setHasAttempted] = useState(false);
    const attemptCountRef = useRef(0);
    const MAX_ATTEMPTS = 3;

    // Debug log whenever user state changes
    useEffect(() => {
        console.log('Current user state:', {
            token: !!token, // Just log if token exists, not the actual token
            role,
            loading,
            error
        });
    }, [token, role, loading, error]);

    // Create a debounced version of our fetch function
    const debouncedFetchUserData = useDebounce(async () => {
        if (attemptCountRef.current < MAX_ATTEMPTS) {
            console.log(`Fetching user data (attempt ${attemptCountRef.current + 1}/${MAX_ATTEMPTS})`);
            attemptCountRef.current += 1;
            const response = await dispatch(getUserData());
            console.log('Fetch response:', response);
            const role = useSelector((state: RootState) => state.user.role);
            console.log('Fetched role:', role);
        }
    }, 1000);

    useEffect(() => {
        // If we have a token but no role and haven't tried fetching yet
        if (token && !role && !loading && !hasAttempted) {
            console.log('AuthMiddleware: Token exists but no role. Loading user data...');
            setHasAttempted(true);
            debouncedFetchUserData();
        }

        // Reset attempt tracking if we get a role
        if (role) {
            console.log(`Role detected: ${role}. Resetting attempt counter.`);
            attemptCountRef.current = 0;
            setHasAttempted(false);
        }

        // If loading finished but we still don't have a role, maybe try again
        if (hasAttempted && !loading && !role && attemptCountRef.current < MAX_ATTEMPTS) {
            console.log('Loading finished but still no role, trying again');
            debouncedFetchUserData();
        }
    }, [token, role, loading, hasAttempted, debouncedFetchUserData]);

    // For extreme debugging, force-update the role from localStorage if available
    useEffect(() => {
        // This is a workaround if the reducer isn't working properly
        const tryRestoreRoleFromLocalStorage = () => {
            try {
                // Only do this if we've exhausted our API attempts
                if (attemptCountRef.current >= MAX_ATTEMPTS && token && !role) {
                    const savedUserData = localStorage.getItem('userData');
                    if (savedUserData) {
                        const userData = JSON.parse(savedUserData);
                        if (userData.role) {
                            console.log('Restoring role from localStorage:', userData.role);
                            // You would need to add a setRole action to your userSlice
                            // dispatch(setRole(userData.role));
                            window.location.reload(); // Extreme measure, reload the page
                        }
                    }
                }
            } catch (e) {
                console.error('Error restoring role from localStorage:', e);
            }
        };

        if (attemptCountRef.current >= MAX_ATTEMPTS) {
            tryRestoreRoleFromLocalStorage();
        }
    }, [attemptCountRef.current, token, role, dispatch]);

    return <>{children}</>;
};

export default AuthMiddleware;