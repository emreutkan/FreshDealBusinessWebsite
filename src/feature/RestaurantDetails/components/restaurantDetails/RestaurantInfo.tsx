import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RestaurantInfo.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { removeRestaurant } from '../../../../redux/thunks/restaurantThunk';
import { AppDispatch, RootState } from '../../../../redux/store';
import { Modal } from '@mui/material';
import {
    IoLocationOutline,
    IoTimeOutline,
    IoCallOutline,
    IoCarOutline,
    IoBicycleOutline,
    IoWalletOutline,
    IoStarOutline
} from 'react-icons/io5';

interface RestaurantInfoProps {
    restaurantId: string | undefined;
}

const formatWorkingDays = (days: string[]) => {
    const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    if (!days || days.length === 0) {
        return 'No working days set';
    }

    if (days.length === 7) {
        return 'Open All Week';
    }

    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    if (weekdays.every(day => days.includes(day)) && days.length === 5) {
        return 'Weekdays';
    }

    const weekends = ['Saturday', 'Sunday'];
    if (weekends.every(day => days.includes(day)) && days.length === 2) {
        return 'Weekends';
    }

    const dayIndices = days.map(day => allDays.indexOf(day)).sort((a, b) => a - b);
    const isContinuous = dayIndices.every((val, i) => i === 0 || val === dayIndices[i - 1] + 1);

    if (isContinuous) {
        return `${allDays[dayIndices[0]].slice(0,3)} - ${allDays[dayIndices[dayIndices.length - 1]].slice(0,3)}`;
    }

    return days.map(day => day.slice(0, 3)).join(', ');
};

const RestaurantInfo: React.FC<RestaurantInfoProps> = ({ restaurantId }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { ownedRestaurants, loading } = useSelector((state: RootState) => state.restaurant);

    console.log('RestaurantInfo.tsx', restaurantId);

    const restaurant = ownedRestaurants.find(
        (restaurant) => restaurant.id === restaurantId
    );

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>Loading restaurant information...</p>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className={styles.notFound}>
                <h2>Restaurant not found</h2>
                <p>The requested restaurant could not be found.</p>
            </div>
        );
    }

    const handleDelete = async () => {
        try {
            await dispatch(removeRestaurant(restaurant.id)).unwrap();
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Failed to delete restaurant:', error);
        }
    };

    const handleEdit = () => {
        navigate('/partnership', { state: { isEditing: true, restaurant } });
    };

    const rating = restaurant.rating || 0;
    const ratingCount = restaurant.ratingCount || 0;

    return (
        <div className={styles.overviewContainer}>
            <div className={styles.restaurantHeader}>
                <div className={styles.headerContent}>
                    <div className={styles.headerLeft}>
                        <div className={styles.restaurantImage}>
                            {restaurant.image_url && (
                                <img src={restaurant.image_url} alt={restaurant.restaurantName} />
                            )}
                        </div>
                        <div className={styles.restaurantMainInfo}>
                            <h1>{restaurant.restaurantName}</h1>
                            <p className={styles.category}>{restaurant.category || 'Uncategorized'}</p>
                            <div className={styles.rating}>
                                <IoStarOutline />
                                <span>{rating.toFixed(1)}</span>
                                <span className={styles.ratingCount}>({ratingCount} reviews)</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.actionButtons}>
                        <button
                            onClick={handleEdit}
                            className={`${styles.actionButton} ${styles.editButton}`}
                        >
                            Edit Restaurant
                        </button>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                        >
                            Remove Restaurant
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                    <div className={styles.infoIcon}>
                        <IoTimeOutline />
                    </div>
                    <div className={styles.infoContent}>
                        <h3>Working Hours</h3>
                        <p>{restaurant.workingHoursStart || 'Not set'} - {restaurant.workingHoursEnd || 'Not set'}</p>
                        <p className={styles.subInfo}>{formatWorkingDays(restaurant.workingDays || [])}</p>
                    </div>
                </div>

                <div className={styles.infoCard}>
                    <div className={styles.infoIcon}>
                        <IoLocationOutline />
                    </div>
                    <div className={styles.infoContent}>
                        <h3>Location</h3>
                        <p>Lat: {restaurant.latitude || 'Not set'}</p>
                        <p>Long: {restaurant.longitude || 'Not set'}</p>
                    </div>
                </div>

                <div className={styles.infoCard}>
                    <div className={styles.infoIcon}>
                        <IoCallOutline />
                    </div>
                    <div className={styles.infoContent}>
                        <h3>Contact</h3>
                        <p>{restaurant.restaurantPhone || 'No phone number'}</p>
                        <p className={styles.subInfo}>{restaurant.restaurantEmail || 'No email'}</p>
                    </div>
                </div>

                {restaurant.delivery && (
                    <div className={styles.infoCard}>
                        <div className={styles.infoIcon}>
                            <IoCarOutline />
                        </div>
                        <div className={styles.infoContent}>
                            <h3>Delivery Details</h3>
                            <p>Range: {restaurant.maxDeliveryDistance || 0}km</p>
                            <p className={styles.subInfo}>Fee: €{(restaurant.deliveryFee || 0).toFixed(2)}</p>
                        </div>
                    </div>
                )}

                {restaurant.pickup && (
                    <div className={styles.infoCard}>
                        <div className={styles.infoIcon}>
                            <IoBicycleOutline />
                        </div>
                        <div className={styles.infoContent}>
                            <h3>Pickup Available</h3>
                            <p>Self pickup enabled</p>
                        </div>
                    </div>
                )}

                <div className={styles.infoCard}>
                    <div className={styles.infoIcon}>
                        <IoWalletOutline />
                    </div>
                    <div className={styles.infoContent}>
                        <h3>Minimum Order</h3>
                        <p>€{(restaurant.minOrderAmount || 0).toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div className={styles.descriptionSection}>
                <h2>About</h2>
                <p>{restaurant.restaurantDescription || 'No description available.'}</p>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                className={styles.modal}
            >
                <div className={styles.modalContent}>
                    <h3>Confirm Deletion</h3>
                    <p>Are you sure you want to remove {restaurant.restaurantName}?</p>
                    <p className={styles.modalWarning}>
                        This action cannot be undone.
                    </p>
                    <div className={styles.modalButtons}>
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className={styles.cancelButton}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            className={styles.confirmButton}
                        >
                            Remove Restaurant
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default RestaurantInfo;