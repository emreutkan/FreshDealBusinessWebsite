import React from 'react';
import { useParams, NavLink, Routes, Route, Navigate } from 'react-router-dom';
import styles from './RestaurantDetails.module.css';
import RestaurantInfo from "../components/restaurantDetails/RestaurantInfo";
import RestaurantListings from "../components/restaurantListings/RestaurantListings";
import Orders from "../components/Orders/Orders";
import { IoRestaurantOutline, IoListOutline, IoReceiptOutline } from 'react-icons/io5';

const RestaurantDetails: React.FC = () => {
    const { restaurantId } = useParams<{ restaurantId: string }>();

    if (!restaurantId) {
        return null;
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                <nav className={styles.tabNavigation}>
                    <NavLink
                        to={`/dashboard/${restaurantId}/orders`}
                        className={({ isActive }) => `${styles.tabItem} ${isActive ? styles.active : ''}`}
                    >
                        <IoReceiptOutline />
                        <span>Orders</span>
                    </NavLink>
                    <NavLink
                        to={`/dashboard/${restaurantId}/listings`}
                        className={({ isActive }) => `${styles.tabItem} ${isActive ? styles.active : ''}`}
                    >
                        <IoListOutline />
                        <span>Listings</span>
                    </NavLink>
                    <NavLink
                        to={`/dashboard/${restaurantId}/overview`}
                        className={({ isActive }) => `${styles.tabItem} ${isActive ? styles.active : ''}`}
                    >
                        <IoRestaurantOutline />
                        <span>Overview</span>
                    </NavLink>
                </nav>

                <div className={styles.content}>
                    <Routes>
                        <Route path="orders" element={<Orders restaurantId={restaurantId} />} />
                        <Route path="listings" element={<RestaurantListings restaurantId={restaurantId} />} />
                        <Route path="overview" element={<RestaurantInfo restaurantId={Number(restaurantId)} />} />
                        <Route path="*" element={<Navigate to="orders" replace />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default RestaurantDetails;