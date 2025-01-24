import React, {useState} from 'react';
import {
    useSelector } from 'react-redux';
import { RootState } from "../../../redux/store.ts";
import styles from './RestaurantsPage.module.css';
import RestaurantCard from "../components/RestaurantCard/RestaurantCard.tsx";
import {useNavigate} from "react-router-dom";
import Header from "../../Header/Header.tsx";

const RestaurantsPage: React.FC = () => {
    const [activePage, setActivePage] = useState('Restaurants');

    const navigate = useNavigate();
    const ownedRestaurants = useSelector((state: RootState) => state.restaurant.ownedRestaurants);
    return (
        <>
            <Header
                activePage={activePage}
                setActivePage={setActivePage}
            />


            <div style={{
                backgroundColor: "#b2f7a5",
                display: "flex",
                justifyContent: "center",
            }}>

                <div className={styles.outerDiv}>
                    <h1>Your Restaurants</h1>
                    {ownedRestaurants.length === 0 ? (
                        <p>You have not added any restaurants yet.</p>
                    ) : (
                        ownedRestaurants.map((restaurant) => (
                            <RestaurantCard
                                key={restaurant.id}
                                restaurant={restaurant}
                                onClick={() => navigate(`/Restaurant/${restaurant.id}`)}
                            />
                        ))
                    )}
                </div>
            </div>
        </>

    );
};

export default RestaurantsPage;
