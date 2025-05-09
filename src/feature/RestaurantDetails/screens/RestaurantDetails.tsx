import React from 'react';
import { useParams, NavLink, Routes, Route, Navigate } from 'react-router-dom';
import styles from './RestaurantDetails.module.css';
import RestaurantInfo from "../components/restaurantDetails/RestaurantInfo";
import RestaurantListings from "../components/restaurantListings/RestaurantListings";
import Orders from "../components/Orders/Orders";
import Comments from "../components/Comments/Comments";
import Analytics from "../components/Analytics/Analytics";
import { IoRestaurantOutline, IoListOutline, IoReceiptOutline, IoChatbubbleOutline, IoStatsChartOutline } from 'react-icons/io5';
import NotificationTest from "../components/NotificationTest/NotificationTest.tsx";

const RestaurantDetails: React.FC = () => {
    const { restaurantId } = useParams<{ restaurantId: string }>();

    if (!restaurantId) {
        return null;
    }

    return (
        <div className={styles.pageWrapper}>
            <NotificationTest />

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
                        to={`/dashboard/${restaurantId}/comments`}
                        className={({ isActive }) => `${styles.tabItem} ${isActive ? styles.active : ''}`}
                    >
                        <IoChatbubbleOutline />
                        <span>Comments</span>
                    </NavLink>
                    <NavLink
                        to={`/dashboard/${restaurantId}/analytics`}
                        className={({ isActive }) => `${styles.tabItem} ${isActive ? styles.active : ''}`}
                    >
                        <IoStatsChartOutline />
                        <span>Analytics</span>
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
                        <Route path="comments" element={<Comments restaurantId={restaurantId} />} />
                        <Route path="analytics" element={<Analytics restaurantId={restaurantId} />} />
                        <Route path="overview" element={<RestaurantInfo restaurantId={Number(restaurantId)} />} />
                        <Route path="*" element={<Navigate to="orders" replace />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default RestaurantDetails;