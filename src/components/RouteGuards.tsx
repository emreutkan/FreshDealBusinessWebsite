import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../redux/store';
import { logout } from '../redux/slices/userSlice';

export function AuthGuard({
                              requiredRole,
                              children
                          }: {
    requiredRole: 'support' | 'owner' | null;
    children: React.ReactNode;
}) {
    const { token, role } = useSelector((state: RootState) => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isChecking, setIsChecking] = useState(true);

    // Customer redirection URL
    const CUSTOMER_REDIRECT_URL = 'https://delightful-bay-05963e103.6.azurestaticapps.net/';

    useEffect(() => {
        console.log('Auth check - token:', !!token, 'role:', role);

        // Not logged in
        if (!token) {
            console.log('No token, redirecting to login');
            navigate('/login', { replace: true });
            return;
        }

        // We have a token, check role
        if (role) {
            console.log(`User role: ${role}, Required role: ${requiredRole}`);

            // If the user is a customer, redirect them to the customer site and log them out
            if (role === 'customer') {
                console.log('Customer detected, redirecting to customer site');
                dispatch(logout());
                // Use window.location to navigate to external URL
                window.location.href = CUSTOMER_REDIRECT_URL;
                return;
            }

            // Check if user has the required role
            if (requiredRole === null || role === requiredRole) {
                // User is authorized for this route
                console.log('User is authorized');
                setIsChecking(false);
            } else {
                // User doesn't have the required role, redirect based on their actual role
                console.log('User has wrong role, redirecting');
                if (role === 'support') {
                    navigate('/support-dashboard', { replace: true });
                } else if (role === 'owner') {
                    navigate('/dashboard', { replace: true });
                } else {
                    // If role is something unexpected
                    navigate('/login', { replace: true });
                }
            }
        } else {
            // We have a token but no role yet
            console.log('Token exists but no role information');
            // Since we can't fetch the role here reliably, we'll let the component render
            // The Login component should check for token and redirect appropriately
            setIsChecking(false);
        }
    }, [token, role, requiredRole, navigate, dispatch]);

    if (isChecking) {
        return <div>Checking authorization...</div>;
    }

    return <>{children}</>;
}

