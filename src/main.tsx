import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import store from "./redux/store.ts";
import {Provider} from "react-redux";
import {UserProvider} from "./context/UserContext.tsx";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import RestaurantsPage from "./pages/RestaurantsPage.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <Provider store={store}>
          <UserProvider>
              <Router>
                  <Routes>
                      <Route path="/" element={<HomePage/>}/>
                      <Route path="/restaurants" element={<RestaurantsPage/>}/>

                  </Routes>
              </Router>
          </UserProvider>
      </Provider>
  </StrictMode>,
)
