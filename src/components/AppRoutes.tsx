import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

// Import your components
import Landing from "../feature/Landing/screens/Landing";
import Login from "../feature/Login/Login";
import Register from "../feature/Register/Register";
import Dashboard from "../feature/Dashboard/Dashboard";
import PartnershipPage from "../feature/Partnership/screens/partnershipPage";
import RestaurantSupportPage from "../feature/Tickets/screens/RestaurantSupport";
import SupportDashboardPage from "../feature/Tickets/screens/SupportDashboard";
import PunishRestaurantPage from "../feature/Tickets/screens/PunishRestaurant";

const AppRoutes: React.FC = () => {
    const { token, role, loading } = useSelector((state: RootState) => state.user);

    // Show loading state if we have a token but we're loading or don't have a role yet
    if (token && (loading || !role)) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading user data...</p>
            </div>
        );
    }

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={
                !token ? <Landing /> :
                    role === 'support' ? <Navigate to="/support-dashboard" replace /> :
                        <Navigate to="/dashboard" replace />
            } />

            <Route path="/login" element={
                !token ? <Login /> :
                    role === 'support' ? <Navigate to="/support-dashboard" replace /> :
                        <Navigate to="/dashboard" replace />
            } />

            <Route path="/register" element={
                !token ? <Register /> :
                    role === 'support' ? <Navigate to="/support-dashboard" replace /> :
                        <Navigate to="/dashboard" replace />
            } />

            {/* Owner routes */}
            <Route path="/dashboard" element={
                !token ? <Navigate to="/login" replace /> :
                    role === 'owner' ? <Dashboard /> :
                        <Navigate to="/support-dashboard" replace />
            } />

            <Route path="/dashboard/:restaurantId/*" element={
                !token ? <Navigate to="/login" replace /> :
                    role === 'owner' ? <Dashboard /> :
                        <Navigate to="/support-dashboard" replace />
            } />

            <Route path="/partnership" element={
                !token ? <Navigate to="/login" replace /> :
                    role === 'owner' ? <PartnershipPage /> :
                        <Navigate to="/support-dashboard" replace />
            } />

            {/* Support routes */}
            <Route path="/support-dashboard" element={
                !token ? <Navigate to="/login" replace /> :
                    role === 'support' ? <SupportDashboardPage /> :
                        <Navigate to="/dashboard" replace />
            } />

            <Route path="/restaurant-support/:restaurantId" element={
                !token ? <Navigate to="/login" replace /> :
                    role === 'support' ? <RestaurantSupportPage /> :
                        <Navigate to="/dashboard" replace />
            } />

            <Route path="/punish-restaurant/:id" element={
                !token ? <Navigate to="/login" replace /> :
                    role === 'support' ? <PunishRestaurantPage /> :
                        <Navigate to="/dashboard" replace />
            } />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;