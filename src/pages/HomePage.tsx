import './HomePage.css';
import Navbar from "../components/feature/Navbar/Navbar";
import React from "react";
import AboutUs from "../components/feature/AboutUs/AboutUs.tsx";

const HomePage: React.FC = () => {

    return (
        <>
            <Navbar/>
            <AboutUs></AboutUs>

        </>


)
    ;
}

export default HomePage;
