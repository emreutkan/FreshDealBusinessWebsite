import './Landing.css';
import Header from "../../Header/Header.tsx";
import React, {useState} from "react";
import AboutUs from "../components/AboutUs/AboutUs.tsx";

const Landing: React.FC = () => {

    const [activePage, setActivePage] = useState("AboutUs");

    return (
        <>
            <Header
                activePage={activePage}
                setActivePage={setActivePage}
            />
            {activePage === 'AboutUs' && <AboutUs/>}


        </>


    )
        ;
}

export default Landing;
