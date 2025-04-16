import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton, Modal, Tooltip, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import styles from './RestaurantListings.module.css';
import { Listing } from "../../../../types/listingRelated";
import ListingModel from "../addListingModel/ListingModel";
import { AppDispatch, RootState } from "../../../../redux/store";
import { deleteListing, getListings } from "../../../../redux/thunks/listingThunks";
import { fetchRestaurantPurchases } from "../../../../redux/thunks/purchaseThunks";

interface RestaurantListingsProps {
    restaurantId: string;
}

type FilterType = 'all' | 'delivery' | 'pickup' | 'both';

const RestaurantListings: React.FC<RestaurantListingsProps> = ({ restaurantId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'price' | 'date' | 'count'>('date');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const { listings, loading } = useSelector((state: RootState) => state.listing);

    useEffect(() => {
        if (restaurantId) {
            dispatch(fetchRestaurantPurchases(restaurantId));
            dispatch(getListings({ restaurantId: Number(restaurantId) }));
        }
    }, [dispatch, restaurantId]);

    const handleEdit = (listing: Listing) => {
        setSelectedListing(listing);
        setIsModalOpen(true);
    };

    const handleDelete = async (listingId: number) => {
        if (window.confirm('Are you sure you want to delete this listing?')) {
            try {
                await dispatch(deleteListing(listingId)).unwrap();
                dispatch(getListings({ restaurantId: Number(restaurantId) }));
            } catch (error) {
                alert('Failed to delete listing: ' + error);
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedListing(null);
    };

    const handleAddNew = () => {
        setSelectedListing(null);
        setIsModalOpen(true);
    };

    const filteredListings = listings
        .filter(listing => {
            const matchesSearch =
                listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (listing.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());

            const hasDelivery = typeof listing.delivery_price === 'number';
            const hasPickup = typeof listing.pick_up_price === 'number';

            switch (filterType) {
                case 'delivery':
                    return matchesSearch && hasDelivery;
                case 'pickup':
                    return matchesSearch && hasPickup;
                case 'both':
                    return matchesSearch && hasDelivery && hasPickup;
                default:
                    return matchesSearch;
            }
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price':
                    return b.original_price - a.original_price;
                case 'count':
                    return b.count - a.count;
                default:
                    return b.id - a.id;
            }
        });

    return (
        <div className={styles.listingsContainer}>
            <div className={styles.header}>
                <div className={styles.headerMain}>
                    <h2 className={styles.sectionTitle}>Active Listings</h2>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        className={styles.addNewButton}
                        onClick={handleAddNew}
                    >
                        Add New Listing
                    </Button>
                </div>

                <div className={styles.filterSection}>
                    <div className={styles.searchBar}>
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Search by title or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                className={styles.clearSearch}
                                onClick={() => setSearchTerm('')}
                            >
                                ×
                            </button>
                        )}
                    </div>

                    <div className={styles.filterControls}>
                        <div className={styles.filterGroup}>
                            <FilterListIcon />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as FilterType)}
                                className={styles.filterSelect}
                            >
                                <option value="all">All Listings</option>
                                <option value="delivery">Delivery Only</option>
                                <option value="pickup">Pickup Only</option>
                                <option value="both">Delivery & Pickup</option>
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'price' | 'date' | 'count')}
                                className={styles.sortSelect}
                            >
                                <option value="date">Newest First</option>
                                <option value="price">Price: High to Low</option>
                                <option value="count">Availability</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.loader}></div>
                    <p>Loading listings...</p>
                </div>
            ) : (
                <>
                    {filteredListings.length === 0 ? (
                        <div className={styles.emptyState}>
                            <InventoryIcon className={styles.emptyStateIcon} />
                            <h3>No Listings Found</h3>
                            <p>
                                {searchTerm || filterType !== 'all'
                                    ? 'No matches found. Try different filters or search terms.'
                                    : 'Start by adding your first listing.'}
                            </p>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAddNew}
                                className={styles.emptyStateButton}
                            >
                                Add Your First Listing
                            </Button>
                        </div>
                    ) : (
                        <div className={styles.listingsGrid}>
                            {filteredListings.map((listing) => (
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
                                            src={listing.imageUrl}
                                            alt={listing.title}
                                            className={styles.restaurantImage}
                                        />
                                        <div className={styles.deliveryOptions}>
                                            {listing.delivery_price !== null && (
                                                <span className={styles.deliveryBadge}>Delivery</span>
                                            )}
                                            {listing.pick_up_price !== null && (
                                                <span className={styles.pickupBadge}>Pickup</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.listingInfo}>
                                        <h3 className={styles.listingTitle}>{listing.title}</h3>
                                        <p className={styles.listingDescription}>{listing.description}</p>

                                        <div className={styles.priceSection}>
                                            <div className={styles.mainPrice}>
                                                <LocalOfferIcon className={styles.priceIcon} />
                                                <span>€{listing.original_price.toFixed(2)}</span>
                                            </div>
                                            <div className={styles.alternativePrices}>
                                                {listing.pick_up_price  && (
                                                    <div className={styles.priceTag}>
                                                        Pickup: €{listing.pick_up_price.toFixed(2)}
                                                    </div>
                                                )}
                                                {listing.delivery_price && (
                                                    <div className={styles.priceTag}>
                                                        Delivery: €{listing.delivery_price.toFixed(2)}
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
                </>
            )}

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
    );
};

export default RestaurantListings;