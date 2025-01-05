// src/components/RestaurantCard/RestaurantCard.tsx
import React from 'react';
import {Restaurant} from "../../../../redux/slices/restaurantSlice.ts";
import styles from './RestaurantCard.module.css'; // Create this CSS module for styling
import { Link } from 'react-router-dom';

interface RestaurantCardProps {
    restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
    return (
        <div className={styles.card}>
            {restaurant.image_url && (
                <img src={restaurant.image_url} alt={restaurant.restaurantName} className={styles.image} />
            )}
            <div className={styles.details}>
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
                    <strong>Working Hours:</strong> {restaurant.workingHoursStart} - {restaurant.workingHoursEnd}
                </p>
                <p>
                    <strong>Listings:</strong> {restaurant.listings}
                </p>
                <p>
                    <strong>Rating:</strong> {restaurant.rating} ({restaurant.ratingCount} reviews)
                </p>
                <Link to={`/restaurants/${restaurant.id}`} className={styles.viewButton}>
                    View Details
                </Link>
            </div>
        </div>
    );
};

export default RestaurantCard;
