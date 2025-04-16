import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Restaurant } from '../../../redux/slices/restaurantSlice';
import styles from './RestaurantSidebar.module.css';
import {
    IoRestaurantOutline,
    IoAddCircleOutline,
    IoMenuOutline,
    IoContractOutline
} from 'react-icons/io5';

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
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (isLoading) {
        return (
            <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
                <div className={styles.loading}>
                    <div className={styles.loadingSpinner}></div>
                    {!isCollapsed && <p>Loading restaurants...</p>}
                </div>
            </aside>
        );
    }

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
            <div className={styles.sidebarHeader}>
                {!isCollapsed && <h2>My Restaurants</h2>}
                <button
                    className={styles.collapseButton}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <IoMenuOutline /> : <IoContractOutline />}
                </button>
            </div>

            <nav className={styles.restaurantList}>
                {restaurants.map((restaurant) => {
                    const isActive = restaurant.id === selectedRestaurantId;

                    return (
                        <Link
                            key={restaurant.id}
                            to={`/dashboard/${restaurant.id}/orders`}
                            className={`${styles.restaurantItem} ${isActive ? styles.active : ''} ${
                                isCollapsed ? styles.collapsed : ''
                            }`}
                            title={restaurant.restaurantName}
                        >
                            <div className={styles.restaurantIcon}>
                                {restaurant.image_url ? (
                                    <img src={restaurant.image_url} alt={restaurant.restaurantName} />
                                ) : (
                                    <IoRestaurantOutline />
                                )}
                            </div>

                            {!isCollapsed && isActive && (
                                <div className={styles.selectedIndicator} />
                            )}

                            {!isCollapsed && (
                                <div className={styles.restaurantInfo}>
                                    <h3>{restaurant.restaurantName}</h3>
                                    <span>{restaurant.category}</span>
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className={`${styles.addRestaurantContainer} ${isCollapsed ? styles.collapsed : ''}`}>
                <Link
                    to="/Partnership"
                    className={styles.addRestaurantButton}
                    title="Add New Restaurant"
                >
                    <IoAddCircleOutline />
                    {!isCollapsed && (
                        <span>Add New Restaurant</span>
                    )}
                </Link>
            </div>
        </aside>
    );
};

export default RestaurantSidebar;
