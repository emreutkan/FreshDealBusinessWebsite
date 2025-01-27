// RestaurantInfo.tsx
import React, {useEffect, useRef, useState} from 'react';
import styles from "./RestaurantInfo.module.css";
import { FaStar, FaClock, FaUtensils, FaEdit, FaTrash } from 'react-icons/fa';
import { removeRestaurant } from "../../../../redux/thunks/restaurantThunk.ts";
import { useDispatch } from "react-redux";
import AddBusinessModel from "../../../Partnership/components/addBusinessModel/addBusinessModel.tsx";

interface Restaurant {
    id: string;
    restaurantName: string;
    image_url: string;
    restaurantDescription: string;
    category: string;
    rating: number;
    workingHoursStart: string;
    workingHoursEnd: string;
    workingDays: string[];
    pickup: boolean;
    delivery: boolean;
    maxDeliveryDistance: number;
    deliveryFee: number;
    minOrderAmount: number;
    longitude: number;
    latitude: number;
}

interface RestaurantInfoProps {
    restaurant: Restaurant;
    onAddListing: () => void;
}

const RestaurantInfo: React.FC<RestaurantInfoProps> = ({ restaurant, onAddListing }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const dispatch = useDispatch();

    const handleDelete = async () => {
        try {
            await dispatch(removeRestaurant(restaurant.id));
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Failed to delete restaurant:', error);
        }
    };

    const modalContentRef = useRef<HTMLDivElement>(null);

// Add this useEffect to handle clicks outside the modal
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
                setShowEditForm(false);
            }
        };

        if (showEditForm) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEditForm]);
    // Main restaurant info view
    return (
        <>
            <div className={styles.detailsCard}>
                {/* Image Section */}
                <div className={styles.imageWrapper}>
                    <img
                        src={restaurant.image_url}
                        alt={restaurant.restaurantName}
                        className={styles.restaurantImage}
                    />
                    {restaurant.rating > 0 && (
                        <div className={styles.ratingBadge}>
                            <FaStar /> {restaurant.rating.toFixed(1)}
                        </div>
                    )}
                </div>

                <div className={styles.content}>
                    {/* Header with Title and Action Buttons */}
                    <div className={styles.header}>
                        <h1 className={styles.title}>{restaurant.restaurantName}</h1>
                        <div className={styles.actions}>
                            <button
                                className={styles.editButton}
                                onClick={() => setShowEditForm(true)}
                            >
                                <FaEdit /> Edit
                            </button>
                            <button
                                className={styles.deleteButton}
                                onClick={() => setShowDeleteModal(true)}
                            >
                                <FaTrash /> Remove
                            </button>
                        </div>
                    </div>

                    {/* Category */}
                    <div className={styles.category}>
                        <FaUtensils />
                        <span>{restaurant.category}</span>
                    </div>

                    {/* Description */}
                    <p className={styles.description}>
                        {restaurant.restaurantDescription}
                    </p>

                    {/* Details Section */}
                    <div className={styles.details}>
                        {/* Working Hours */}
                        <div className={styles.hours}>
                            <FaClock />
                            <span>{restaurant.workingHoursStart} - {restaurant.workingHoursEnd}</span>
                        </div>

                        {/* Working Days */}
                        <div className={styles.workingDays}>
                            <span>Working Days: {restaurant.workingDays.join(", ")}</span>
                        </div>

                        {/* Service Information */}
                        {(restaurant.pickup || restaurant.delivery) && (
                            <div className={styles.serviceInfo}>
                                {restaurant.pickup && <span>Pickup Available</span>}
                                {restaurant.delivery && (
                                    <div className={styles.deliveryInfo}>
                                        <span>Delivery Available</span>
                                        <span>Max Distance: {restaurant.maxDeliveryDistance}km</span>
                                        <span>Delivery Fee: ${restaurant.deliveryFee}</span>
                                        <span>Min Order: ${restaurant.minOrderAmount}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Add Listing Button */}
                    <button
                        className={styles.addButton}
                        onClick={onAddListing}
                    >
                        Add New Listing
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Confirm Deletion</h2>
                        <p>Are you sure you want to remove {restaurant.restaurantName}?</p>
                        <p className={styles.warning}>This action cannot be undone.</p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.confirmButton}
                                onClick={handleDelete}
                            >
                                Yes, Remove Restaurant
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showEditForm && (
                <div className={styles.modalOverlay}>
                    <div ref={modalContentRef} className={styles.editModalContent}>
                        <AddBusinessModel
                            isEditing={true}
                            restaurant={restaurant}
                            onClose={() => setShowEditForm(false)}
                        />
                    </div>
                </div>
            )}

        </>
    );
};

export default RestaurantInfo;