import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api';
import store from "./redux/store";
import Landing from "./feature/Landing/screens/Landing";
import PartnershipPage from "./feature/Partnership/screens/partnershipPage";
import RestaurantsPage from "./feature/Restaurant/screens/RestaurantsPage";
import Login from "./feature/Login/Login";
import Register from "./feature/Register/Register";
import Dashboard from "./feature/Dashboard/Dashboard";
import type { Libraries } from '@react-google-maps/api';

const GOOGLE_MAPS_LIBRARIES: Libraries = ['places'];
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API key is missing. Please check your environment variables.');
}

const AppWithMaps = () => {
    return (
        <LoadScript
            googleMapsApiKey={GOOGLE_MAPS_API_KEY || ''}
            libraries={GOOGLE_MAPS_LIBRARIES}
            loadingElement={
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Loading Fresh Deal Maps...</p>
                </div>
            }
        >
            <Provider store={store}>
                <Router>
                    <Routes>
                        <Route path="/" element={<Landing/>} />
                        <Route path="/partnership" element={<PartnershipPage/>} />
                        <Route path="/restaurants" element={<RestaurantsPage/>} />
                        <Route path="/login" element={<Login/>} />
                        <Route path="/register" element={<Register/>} />
                        <Route path="/dashboard" element={<Dashboard/>} />
                        <Route path="/dashboard/:restaurantId/*" element={<Dashboard/>} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </Router>
            </Provider>
        </LoadScript>
    );
};

export default AppWithMaps;