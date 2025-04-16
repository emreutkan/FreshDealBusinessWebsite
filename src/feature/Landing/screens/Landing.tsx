import './Landing.css';
import Header from "../../Header/Header.tsx";
import React, {useState, useEffect} from "react";
import HeroSection from "../components/Hero/HeroSection.tsx";
import Features from "../components/Features/Features.tsx";

const Landing: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 800);
    }, []);

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