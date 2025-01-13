import React from 'react';
import {
    // useDispatch,
    useSelector } from 'react-redux';
// import { fetchOwnedRestaurants } from "../redux/thunks/restaurantThunk.ts";
import { RootState } from "../redux/store.ts";
// import { AppDispatch } from "../redux/store.ts";
import styles from './RestaurantsPage.module.css';
import RestaurantCard from "../components/feature/restaurantPage/RestaurantCard/RestaurantCard.tsx";

const RestaurantsPage: React.FC = () => {
    // const dispatch = useDispatch<AppDispatch>(); // Type the dispatch correctly
    const { ownedRestaurants, status, error } = useSelector((state: RootState) => state.restaurant);
    const { token } = useSelector((state: RootState) => state.user);

    // useEffect(() => {
    //     if (token) {
    //         dispatch(fetchOwnedRestaurants()); // Fetch owned restaurants
    //     }
    // }, [dispatch, token]);


    if (!token) {
        return (
            <>
                <div>Please log in to view your restaurants.</div>;
            </>
        )
    }

    return (
        <>
            <div className={styles.container}>
                <h1>Your Restaurants</h1>
                {status === 'loading' && <p>Loading your restaurants...</p>}
                {status === 'failed' && <p style={{color: 'red'}}>{error}</p>}
                {status === 'succeeded' && ownedRestaurants.length === 0 && (
                    <p>You have not added any restaurants yet.</p>
                )}
                <div className={styles.restaurantsGrid}>
                    {ownedRestaurants.map((restaurant) => (
                        <RestaurantCard key={restaurant.id} restaurant={restaurant}/>
                    ))}
                </div>
            </div>
        </>

    );
};

export default RestaurantsPage;
