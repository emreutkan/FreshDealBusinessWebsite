import React from 'react';
import styles from './RestaurantCard.module.css';
import {Restaurant} from "../../../../redux/slices/restaurantSlice.ts";

interface RestaurantCardProps {
    restaurant: Restaurant;
    onClick?: () => void; // Callback to open RestaurantDetails
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
                                                           restaurant,
                                                           onClick,
                                                       }) => {
    return (
        <div className={styles.card} onClick={onClick}>
            {/* If you have a restaurant image, show it on top */}
            {restaurant.image_url && (
                <div className={styles.imageContainer}>
                    <img src={restaurant.image_url} alt={restaurant.restaurantName} />
                </div>
            )}
            <div className={styles.infoContainer}>
                <h2>{restaurant.restaurantName}</h2>
                <p>{restaurant.restaurantDescription}</p>

                <p>
                    <strong>Category:</strong> {restaurant.category}
                </p>
                <p>
                    <strong>Location:</strong> ({restaurant.latitude}, {restaurant.longitude})
                </p>
                <p>
                    <strong>Working Days:</strong> {restaurant.workingDays.join(', ')}
                </p>
                <p>
                    <strong>Hours:</strong>{' '}
                    {restaurant.workingHoursStart} - {restaurant.workingHoursEnd}
                </p>
                <p>
                    <strong>Listings:</strong> {restaurant.listings}
                </p>
                <p>
                    <strong>Rating:</strong> {restaurant.rating} (
                    {restaurant.ratingCount} reviews)
                </p>

                <div className={styles.detailsLink}>
                    <span>View Details</span>
                    {/* Right arrow SVG or icon */}
                    <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                        className={styles.arrowIcon}
                    >
                        <path d="M7.646 15.354a.5.5 0 0 0 .708 0l6.708-6.708a1.494 1.494 0 0 0 0-2.084L8.354.646a.5.5 0 1 0-.708.708l6.356 6.356a.497.497 0 0 1 0 .708l-6.356 6.356a.5.5 0 0 0 0 .708z" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default RestaurantCard;
