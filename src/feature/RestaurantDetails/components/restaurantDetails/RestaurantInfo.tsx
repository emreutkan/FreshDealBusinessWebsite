import React, { useState } from 'react';
import styles from './RestaurantInfo.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { removeRestaurant } from "../../../../redux/thunks/restaurantThunk";
import { RootState } from "../../../../redux/store.ts";
import { Modal } from '@mui/material';
import ListingModel from "../addListingModel/ListingModel";

interface RestaurantInfoProps {
    restaurantId: string | undefined;
}

const formatWorkingDays = (days: string[]) => {
    const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
    const dispatch = useDispatch();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showListingModal, setShowListingModal] = useState(false);
    const { ownedRestaurants } = useSelector((state: RootState) => state.restaurant);

    const restaurant = ownedRestaurants.find(
        (restaurant) => restaurant.id === Number(restaurantId)
    );

    const handleDelete = async () => {
        try {
            await dispatch(removeRestaurant(restaurant.id));
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Failed to delete restaurant:', error);
        }
    };

    const handleAddNewListing = () => {
        setShowListingModal(true);
    };

    const handleCloseListingModal = () => {
        setShowListingModal(false);
    };

    return (
        <>
            <div className={styles.card}>
                <div className={styles.imageWrapper}>
                    <div className={styles.imageOverlay} />
                    <img
                        src={restaurant.image_url}
                        alt={restaurant.restaurantName}
                        className={styles.restaurantImage}
                    />
                    {restaurant.rating > 0 && (
                        <div className={styles.ratingBadge}>
                            <span>{restaurant.rating.toFixed(1)} ★</span>
                        </div>
                    )}
                </div>

                <div className={styles.contentContainer}>
                    <div className={styles.headerSection}>
                        <h2 className={styles.title}>
                            {restaurant.restaurantName}
                            <span className={styles.highlight}></span>
                        </h2>
                        <div className={styles.actionButtons}>
                            <button
                                onClick={() => setShowEditForm(true)}
                                className={`${styles.actionButton} ${styles.editButton}`}
                            >
                                Edit Restaurant
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className={`${styles.actionButton} ${styles.deleteButton}`}
                            >
                                Remove
                            </button>
                        </div>
                    </div>

                    <p className={styles.description}>{restaurant.restaurantDescription}</p>

                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Category</span>
                            <span className={styles.statValue}>{restaurant.category}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Hours</span>
                            <span className={styles.statValue}>
                                {restaurant.workingHoursStart} - {restaurant.workingHoursEnd}
                            </span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Open</span>
                            <span className={styles.statValue}>
                                {formatWorkingDays(restaurant.workingDays)}
                            </span>
                        </div>

                        {restaurant.delivery && (
                            <>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>Delivery Range</span>
                                    <span className={styles.statValue}>{restaurant.maxDeliveryDistance}km</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>Delivery Fee</span>
                                    <span className={styles.statValue}>${restaurant.deliveryFee}</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>Min. Order</span>
                                    <span className={styles.statValue}>${restaurant.minOrderAmount}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className={styles.ctaContainer}>
                        <button
                            className={styles.addButton}
                            onClick={handleAddNewListing}
                        >
                            Add New Listing
                        </button>
                    </div>
                </div>

                {/* Add Listing Modal */}
                <Modal
                    open={showListingModal}
                    onClose={handleCloseListingModal}
                    className={styles.modalWrapper}
                    disableAutoFocus
                >
                    <div className={styles.modalContainer}>
                        <ListingModel
                            restaurantId={Number(restaurantId)}
                            onClose={handleCloseListingModal}
                            isEditing={false}
                        />
                    </div>
                </Modal>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <h3>Confirm Deletion</h3>
                            <p>Are you sure you want to remove {restaurant.restaurantName}?</p>
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
                    </div>
                )}
            </div>
        </>
    );
};

export default RestaurantInfo;