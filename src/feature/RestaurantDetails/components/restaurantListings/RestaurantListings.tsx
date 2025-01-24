import React from 'react';
import styles from './RestaurantListings.module.css';



interface RestaurantListingsProps {
    listings: Listing[];
    loading: boolean;
}

const RestaurantListings: React.FC<RestaurantListingsProps> = ({ listings, loading }) => {
    return (
        <div className={styles.listingsCard}>
            <h2>Active Listings</h2>
            {loading ? (
                <p>Loading listings...</p>
            ) : (
                <div className={styles.listingsGrid}>
                    {listings.map((listing) => (
                        <div key={listing.id} className={styles.listingItem}>
                            <img
                                src={listing.imageUrl}
                                alt={listing.title}
                                className={styles.listingImage}
                            />
                            <div className={styles.listingInfo}>
                                <h3>{listing.title}</h3>
                                <p>{listing.description}</p>
                                <div className={styles.listingPrices}>
                                    <span>Original: ${listing.originalPrice}</span>
                                    {listing.pickUpPrice && (
                                        <span>Pickup: ${listing.pickUpPrice}</span>
                                    )}
                                    {listing.deliveryPrice && (
                                        <span>Delivery: ${listing.deliveryPrice}</span>
                                    )}
                                </div>
                                <div className={styles.listingDetails}>
                                    <span>Available: {listing.count}</span>
                                    <span>Consume within: {listing.consumeWithin} days</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RestaurantListings;