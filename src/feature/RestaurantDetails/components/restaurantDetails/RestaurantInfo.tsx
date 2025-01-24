import React from 'react';
import styles from "./RestaurantInfo.module.css"
interface RestaurantInfoProps {
    restaurant: {
        restaurantName: string;
        image_url: string;
        restaurantDescription: string;
        category: string;
        rating: number;
        workingHoursStart: string;
        workingHoursEnd: string;
    };
    onAddListing: () => void;
}

const RestaurantInfo: React.FC<RestaurantInfoProps> = ({ restaurant, onAddListing }) => {
    return (
        <div className={styles.detailsCard}>
            <h1>{restaurant.restaurantName}</h1>
            <img
                src={restaurant.image_url}
                alt={restaurant.restaurantName}
                className={styles.restaurantImage}
            />
            <div className={styles.detailsInfo}>
                <p>{restaurant.restaurantDescription}</p>
                <p><strong>Category:</strong> {restaurant.category}</p>
                <p><strong>Rating:</strong> {restaurant.rating}/5</p>
                <p><strong>Hours:</strong> {restaurant.workingHoursStart} - {restaurant.workingHoursEnd}</p>
            </div>

            <button
                className={styles.addListingButton}
                onClick={onAddListing}
            >
                Add New Listing
            </button>
        </div>
    );
};

export default RestaurantInfo;