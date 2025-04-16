import React, {useEffect} from 'react';
import {
    useDispatch,
    useSelector
} from 'react-redux';
import styles from './RestaurantsPage.module.css';
import RestaurantCard from "../components/RestaurantCard/RestaurantCard.tsx";
import {useNavigate} from "react-router-dom";
import Header from "../../Header/Header.tsx";
import { RootState, AppDispatch } from '../../../redux/store.ts';
import {getRestaurantsOfUserThunk} from "../../../redux/thunks/restaurantThunk.ts";

const RestaurantsPage: React.FC = () => {
    const navigate = useNavigate();
    const ownedRestaurants = useSelector((state: RootState) => state.restaurant.ownedRestaurants);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (token) {
            dispatch(getRestaurantsOfUserThunk())
        }
        else {
            console.error('Could not find token');
        }
    }, []);

    return (
        <>
            <Header />
            <div className={styles.pageContainer}>
                <div className={styles.outerDiv}>
                    <h1 className={styles.header}>Your Restaurants</h1>
                    {ownedRestaurants.length === 0 ? (
                        <p className={styles.emptyMessage}>
                            You have not added any restaurants yet.
                        </p>
                    ) : (
                        <div className={styles.restaurantGrid}>
                            {ownedRestaurants.map((restaurant) => (
                                <RestaurantCard
                                    key={restaurant.id}
                                    restaurant={restaurant}
                                    onClick={() => navigate(`/Restaurant/${restaurant.id}`)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default RestaurantsPage;