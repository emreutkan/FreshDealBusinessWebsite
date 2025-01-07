import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from "./pages/HomePage.tsx";
import {UserProvider} from "./context/UserContext.tsx";
import RestaurantsPage from "./pages/RestaurantsPage.tsx";
function App() {
    return (
        <UserProvider>
            <div className="app-container">
                <Router>
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/restaurants" element={<RestaurantsPage />} />

                    </Routes>
                </Router>
            </div>
        </UserProvider>
    );
}

export default App;
