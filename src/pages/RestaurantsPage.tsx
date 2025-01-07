import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOwnedRestaurants } from "../redux/thunks/restaurantThunk.ts";
import { RootState } from "../redux/store.ts";
import { AppDispatch } from "../redux/store.ts";
import styles from './RestaurantsPage.module.css';
import RestaurantCard from "../components/feature/restaurantPage/RestaurantCard/RestaurantCard.tsx";
import AddRestaurantModal from "../components/feature/restaurantPage/addRestaurantModal/AddRestaurantModal.tsx";
import Navbar from "../components/feature/Navbar/Navbar.tsx";

const RestaurantsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>(); // Type the dispatch correctly
    const { ownedRestaurants, status, error } = useSelector((state: RootState) => state.restaurant);
    const { token } = useSelector((state: RootState) => state.user);
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

    useEffect(() => {
        if (token) {
            dispatch(fetchOwnedRestaurants()); // Fetch owned restaurants
        }
    }, [dispatch, token]);

    const openModal = () => setIsModalOpen(true); // Open modal
    const closeModal = () => setIsModalOpen(false); // Close modal

    if (!token) {
        return (
            <>
                <Navbar/>
                <div>Please log in to view your restaurants.</div>;
            </>
        )
    }

    return (
        <>
            <Navbar/>
            <div className={styles.container}>
                <h1>Your Restaurants</h1>
                <button className={styles.addButton} onClick={openModal}>Add Restaurant</button>
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
                {isModalOpen && <AddRestaurantModal onClose={closeModal}/>}
            </div>
        </>

    );
};

export default RestaurantsPage;
