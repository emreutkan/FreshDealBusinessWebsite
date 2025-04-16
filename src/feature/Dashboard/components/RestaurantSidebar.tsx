import React from 'react';
import { Link } from 'react-router-dom';
import { Restaurant } from '../../../redux/slices/restaurantSlice';
import styles from './RestaurantSidebar.module.css';
import { IoRestaurantOutline, IoAddCircleOutline } from 'react-icons/io5';

interface RestaurantSidebarProps {
    restaurants: Restaurant[];
    selectedRestaurantId?: string;
    isLoading: boolean;
}

const RestaurantSidebar: React.FC<RestaurantSidebarProps> = ({
                                                                 restaurants,
                                                                 selectedRestaurantId,
                                                                 isLoading,
                                                             }) => {
    if (isLoading) {
        return (
            <aside className={styles.sidebar}>
                <div className={styles.loading}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Loading restaurants...</p>
                </div>
            </aside>
        );
    }

    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <h2>My Restaurants</h2>
            </div>

            <nav className={styles.restaurantList}>
                {restaurants.map((restaurant) => (
                    <Link
                        key={restaurant.id}
                        to={`/dashboard/${restaurant.id}`}
                        className={`${styles.restaurantItem} ${
                            restaurant.id === selectedRestaurantId ? styles.active : ''
                        }`}
                    >
                        <div className={styles.restaurantIcon}>
                            {restaurant.image_url ? (
                                <img src={restaurant.image_url} alt={restaurant.restaurantName} />
                            ) : (
                                <IoRestaurantOutline />
                            )}
                        </div>
                        <div className={styles.restaurantInfo}>
                            <h3>{restaurant.restaurantName}</h3>
                            <span>{restaurant.category}</span>
                        </div>
                    </Link>
                ))}
            </nav>

            <div className={styles.addRestaurantContainer}>
                <Link to="/Partnership" className={styles.addRestaurantButton}>
                    <IoAddCircleOutline />
                    <span>Add New Restaurant</span>
                </Link>
            </div>
        </aside>
    );
};

export default RestaurantSidebar;