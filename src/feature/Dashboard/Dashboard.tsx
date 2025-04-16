import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState, AppDispatch } from '../../redux/store';
import { getRestaurantsOfUserThunk } from '../../redux/thunks/restaurantThunk';
import Header from '../Header/Header';
import RestaurantSidebar from './components/RestaurantSidebar';
import RestaurantDetails from '../RestaurantDetails/screens/RestaurantDetails';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { restaurantId } = useParams<{ restaurantId?: string }>();
    const { ownedRestaurants, status } = useSelector((state: RootState) => state.restaurant);
    const { name_surname } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        dispatch(getRestaurantsOfUserThunk());
    }, [dispatch]);

    useEffect(() => {
        // If there are restaurants but no restaurant is selected, redirect to the first one
        if (ownedRestaurants.length > 0 && !restaurantId) {
            navigate(`/dashboard/${ownedRestaurants[0].id}`);
        }
    }, [ownedRestaurants, restaurantId, navigate]);

    return (
        <div className={styles.dashboardContainer}>
            <Header />
            <div className={styles.dashboardContent}>
                <RestaurantSidebar
                    restaurants={ownedRestaurants}
                    selectedRestaurantId={restaurantId}
                    isLoading={status === 'loading'}
                />
                <main className={styles.mainContent}>
                    {restaurantId ? (
                        <RestaurantDetails />
                    ) : (
                        <div className={styles.welcomeMessage}>
                            <h1>Welcome, {name_surname}</h1>
                            {ownedRestaurants.length === 0 && status !== 'loading' ? (
                                <p>Get started by adding your first restaurant</p>
                            ) : (
                                <p>Select a restaurant from the sidebar to view details</p>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;