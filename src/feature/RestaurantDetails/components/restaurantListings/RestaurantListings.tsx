import React, {useEffect, useState} from 'react';
import { useDispatch } from 'react-redux';
import { IconButton, Modal, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import InventoryIcon from '@mui/icons-material/Inventory';
import styles from './RestaurantListings.module.css';
import { Listing } from "../../../../types/listingRelated.ts";
import ListingModel from "../addListingModel/ListingModel.tsx";
import { AppDispatch } from "../../../../redux/store";
import { deleteListing } from "../../../../redux/thunks/listingThunks";

interface RestaurantListingsProps {
    listings: Listing[];
    loading: boolean;
    restaurantId: number;
}

const RestaurantListings: React.FC<RestaurantListingsProps> = ({ listings, loading, restaurantId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleEdit = (listing: Listing) => {
        setSelectedListing(listing);
        setIsModalOpen(true);
    };

    const handleDelete = async (listingId: number) => {
        if (window.confirm('Are you sure you want to delete this listing?')) {
            try {
                await dispatch(deleteListing(listingId)).unwrap();
            } catch (error) {
                alert('Failed to delete listing: ' + error);
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedListing(null);
    };


    return (
        <div className={styles.listingsCard}>
            <h2 className={styles.sectionTitle}>Active Listings</h2>
            {loading ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.loader}></div>
                    <p>Loading listings...</p>
                </div>
            ) : (
                <div className={styles.listingsGrid}>
                    {listings.map((listing) => (
                        <div key={listing.id} className={styles.listingItem}>
                            <div className={styles.listingActions}>
                                <Tooltip title="Edit Listing">
                                    <IconButton
                                        onClick={() => handleEdit(listing)}
                                        className={`${styles.actionButton} ${styles.editButton}`}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Listing">
                                    <IconButton
                                        onClick={() => handleDelete(listing.id)}
                                        className={`${styles.actionButton} ${styles.deleteButton}`}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </div>
                            <div className={styles.imageContainer}>
                                <img
                                    src={listing.image_url}
                                    alt={listing.title}
                                    className={styles.restaurantImage}
                                />
                            </div>
                            <div className={styles.listingInfo}>
                                <h3 className={styles.listingTitle}>{listing.title}</h3>
                                <p className={styles.listingDescription}>{listing.description}</p>

                                <div className={styles.priceSection}>
                                    <div className={styles.mainPrice}>
                                        <LocalOfferIcon className={styles.priceIcon} />
                                        <span>${listing.original_price}</span>
                                    </div>
                                    <div className={styles.alternativePrices}>
                                        {listing.pick_up_price && (
                                            <div className={styles.priceTag}>
                                                Pickup: ${listing.pick_up_price}
                                            </div>
                                        )}
                                        {listing.delivery_price && (
                                            <div className={styles.priceTag}>
                                                Delivery: ${listing.delivery_price}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.listingMetrics}>
                                    <div className={styles.metric}>
                                        <InventoryIcon className={styles.metricIcon} />
                                        <span>{listing.count} available</span>
                                    </div>
                                    <div className={styles.metric}>
                                        <EventAvailableIcon className={styles.metricIcon} />
                                        <span>within {listing.consume_within} days</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            <div className={isModalOpen ? styles.modalOverlay : ''}>
                <Modal
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    className={styles.modalWrapper}
                    disableAutoFocus
                >
                    <div className={styles.modalContainer}>
                        <ListingModel
                            restaurantId={restaurantId}
                            onClose={handleCloseModal}
                            listing={selectedListing || undefined}
                            isEditing={!!selectedListing}
                        />
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default RestaurantListings;