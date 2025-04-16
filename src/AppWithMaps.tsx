// AppWithMaps.tsx
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api';
import store from "./redux/store.ts";
import Landing from "./feature/Landing/screens/Landing.tsx";
import RestaurantDetails from "./feature/RestaurantDetails/screens/RestaurantDetails.tsx";
import PartnershipPage from "./feature/Partnership/screens/partnershipPage.tsx";
import RestaurantsPage from "./feature/Restaurant/screens/RestaurantsPage.tsx";
import Login from "./feature/Login/Login.tsx";
import Register from "./feature/Register/Register.tsx";
import type { Libraries } from '@react-google-maps/api';
import Dashboard from "./feature/Dashboard/Dashboard.tsx";

const GOOGLE_MAPS_LIBRARIES: Libraries = ['places'];

// Get the API key and provide a fallback for development
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
// Should be using import.meta.env for Vite

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
            }        >
            <Provider store={store}>
                <Router>
                    <Routes>
                        <Route path="/" element={<Landing/>}/>
                        <Route path="/Partnership" element={<PartnershipPage/>}/>
                        <Route path="/Restaurants" element={<RestaurantsPage/>}/>
                        <Route path="/Restaurant/:restaurantId" element={<RestaurantDetails/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/register" element={<Register/>}/>
                        <Route path="/dashboard" element={<Dashboard/>}/>
                        {/*<Route path="/Restaurants/:restaurantId/addListing" element={<List/>}/>*/}
                    </Routes>
                </Router>
            </Provider>
        </LoadScript>
    );
};

export default AppWithMaps;
