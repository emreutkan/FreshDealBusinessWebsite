import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import store from "./redux/store.ts";
import {Provider} from "react-redux";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Landing from "./feature/Landing/screens/Landing.tsx";
import RestaurantDetails from "./feature/RestaurantDetails/screens/RestaurantDetails.tsx";
import PartnershipPage from "./feature/Partnership/screens/partnershipPage.tsx";
import RestaurantsPage from "./feature/Restaurant/screens/RestaurantsPage.tsx";
import { LoadScript } from '@react-google-maps/api';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <LoadScript
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY!}
          libraries={["places"]}
      >
      <Provider store={store}>
              <Router>
                  <Routes>
                      <Route path="/" element={<Landing/>}/>
                      <Route path="/Partnership" element={<PartnershipPage/>}/>
                      <Route path="/Restaurants" element={<RestaurantsPage/>}/>
                      <Route path="/Restaurant/:restaurantId" element={<RestaurantDetails/>}/>
                  </Routes>
              </Router>
      </Provider>
        </LoadScript>
  </StrictMode>,
)
