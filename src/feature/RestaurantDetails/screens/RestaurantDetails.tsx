import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store';
import {
    fetchRestaurantPurchases,
    acceptPurchaseOrder,
    addCompletionImage
} from '../../../redux/slices/purchaseSlice.ts';
import { getListings } from '../../../redux/thunks/listingThunks';
import styles from './RestaurantDetails.module.css';
import Header from "../../Header/Header";
import AddListingModel from "../components/addListingModel/addListingModel.tsx";

interface Purchase {
    id: number;
    status: string;
    date: string;
    items: Array<{
        quantity: number;
        name: string;
        price: number;
    }>;
    delivery_address?: string;
    total: number;
    completionImage?: string;
}

const RestaurantDetails: React.FC = () => {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const dispatch = useDispatch();

    const { ownedRestaurants } = useSelector((state: RootState) => state.restaurant);
    const { items: purchases, loading, error } = useSelector((state: RootState) => state.purchases);
    const { listings, loading: listingsLoading } = useSelector((state: RootState) => state.listing);

    const [imageUrl, setImageUrl] = useState('');
    const [activeImageUpload, setActiveImageUpload] = useState<number | null>(null);
    const [isAddListingModalOpen, setIsAddListingModalOpen] = useState(false);

    const restaurant = ownedRestaurants.find(
        (restaurant) => restaurant.id === Number(restaurantId)
    );

    useEffect(() => {
        if (restaurantId) {
            dispatch(fetchRestaurantPurchases(Number(restaurantId)));
            dispatch(getListings({ restaurantId: Number(restaurantId) }));
        }
    }, [dispatch, restaurantId]);

    const handleAcceptPurchase = async (purchaseId: number) => {
        try {
            await dispatch(acceptPurchaseOrder(purchaseId)).unwrap();
        } catch (error) {
            console.error('Failed to accept purchase:', error);
        }
    };

    const handleImageUpload = async (purchaseId: number) => {
        if (!imageUrl.trim()) {
            alert('Please enter an image URL');
            return;
        }

        try {
            await dispatch(addCompletionImage({ purchaseId, imageUrl })).unwrap();
            setImageUrl('');
            setActiveImageUpload(null);
        } catch (error) {
            console.error('Failed to upload image:', error);
        }
    };

    const PurchaseActions = ({ purchase }: { purchase: Purchase }) => {
        const isPending = purchase.status === 'pending';
        const isAccepted = purchase.status === 'accepted';
        const needsImage = isAccepted && !purchase.completionImage;

        return (
            <div className={styles.purchaseActions}>
                {isPending && (
                    <button
                        className={styles.acceptButton}
                        onClick={() => handleAcceptPurchase(purchase.id)}
                    >
                        Accept Order
                    </button>
                )}

                {needsImage && (
                    <div className={styles.imageUploadSection}>
                        {activeImageUpload === purchase.id ? (
                            <>
                                <input
                                    type="text"
                                    placeholder="Enter image URL"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className={styles.imageInput}
                                />
                                <button
                                    className={styles.uploadButton}
                                    onClick={() => handleImageUpload(purchase.id)}
                                >
                                    Upload Image
                                </button>
                                <button
                                    className={styles.cancelButton}
                                    onClick={() => setActiveImageUpload(null)}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                className={styles.addImageButton}
                                onClick={() => setActiveImageUpload(purchase.id)}
                            >
                                Add Completion Image
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (!restaurant) {
        return <div className={styles.outerContainer}><p>Restaurant not found.</p></div>;
    }

    return (
        <>
            <Header />
            <div className={styles.container}>
                <div className={styles.content}>
                    {/* Restaurant Details Column */}
                    <div className={styles.detailsColumn}>
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

                            {/* Add Listing Button */}
                            <button
                                className={styles.addListingButton}
                                onClick={() => setIsAddListingModalOpen(true)}
                            >
                                Add New Listing
                            </button>
                        </div>

                        {/* Active Listings Section */}
                        <div className={styles.listingsCard}>
                            <h2>Active Listings</h2>
                            {listingsLoading ? (
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
                    </div>

                    {/* Purchases Column */}
                    <div className={styles.purchasesColumn}>
                        <div className={styles.purchasesCard}>
                            <h2>Orders</h2>
                            {loading && <p className={styles.loading}>Loading orders...</p>}
                            {error && <p className={styles.error}>{error}</p>}

                            <div className={styles.purchasesList}>
                                {purchases.map(purchase => (
                                    <div
                                        key={purchase.id}
                                        className={`${styles.purchaseItem} ${styles[purchase.status]}`}
                                    >
                                        <div className={styles.purchaseHeader}>
                                            <span className={styles.orderId}>Order #{purchase.id}</span>
                                            <span className={styles.status}>{purchase.status}</span>
                                            <span className={styles.date}>{purchase.date}</span>
                                        </div>

                                        <div className={styles.items}>
                                            {purchase.items.map((item, idx) => (
                                                <div key={idx} className={styles.item}>
                                                    <span>{item.quantity}x {item.name}</span>
                                                    <span>${item.price.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {purchase.delivery_address && (
                                            <div className={styles.deliveryInfo}>
                                                <strong>Delivery Address:</strong>
                                                <p>{purchase.delivery_address}</p>
                                            </div>
                                        )}

                                        <div className={styles.total}>
                                            Total: ${purchase.total.toFixed(2)}
                                        </div>

                                        {purchase.completionImage && (
                                            <img
                                                src={purchase.completionImage}
                                                alt="Completion"
                                                className={styles.completionImage}
                                            />
                                        )}

                                        <PurchaseActions purchase={purchase} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Listing Modal */}
            {isAddListingModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <AddListingModel
                            restaurantId={Number(restaurantId)}
                            onClose={() => {
                                setIsAddListingModalOpen(false);
                                dispatch(getListings({ restaurantId: Number(restaurantId) }));
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default RestaurantDetails;