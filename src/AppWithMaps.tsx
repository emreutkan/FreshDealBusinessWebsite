import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api';
import store from "./redux/store";
import AuthMiddleware from './components/AuthMiddleware';
import AppRoutes from './components/AppRoutes';
import type { Libraries } from '@react-google-maps/api';

// Define libraries as a constant outside the component to prevent reloads
const GOOGLE_MAPS_LIBRARIES: Libraries = ['places'];
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const AppWithMaps: React.FC = () => {
    return (
        <Provider store={store}>
            <Router>
                <AuthMiddleware>
                    <LoadScript
                        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                        libraries={GOOGLE_MAPS_LIBRARIES}
                        loadingElement={
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p className="loading-text">Loading Fresh Deal Maps...</p>
                            </div>
                        }
                    >
                        <AppRoutes />
                    </LoadScript>
                </AuthMiddleware>
            </Router>
        </Provider>
    );
};

export default AppWithMaps;