import './Landing.css';
import Header from "../../Header/Header.tsx";
import React, {useState, useEffect} from "react";
import HeroSection from "../components/Hero/HeroSection.tsx";
import Features from "../components/Features/Features.tsx";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../../redux/store';

const Landing: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { token } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        // Check if user is logged in
        if (token) {
            // Redirect to dashboard if user is logged in
            navigate('/dashboard', { replace: true });
        } else {
            // Show landing page with a slight delay for loading animation
            setTimeout(() => setIsLoading(false), 800);
        }
    }, [token, navigate]);

    return (
        <div className="landing-container">
            {isLoading ? (
                <div className="loading-screen">
                    <div className="loading-spinner"></div>
                </div>
            ) : (
                <>
                    <Header />
                    <HeroSection />
                    <Features />
                </>
            )}
        </div>
    );
}

export default Landing;