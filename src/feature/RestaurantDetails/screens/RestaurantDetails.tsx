import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Modal } from '@mui/material';
import { RootState } from '../../../redux/store';
import {
    fetchRestaurantPurchases,
    acceptPurchaseOrder,
    addCompletionImage
} from '../../../redux/thunks/purchaseThunks.ts';
import { getListings } from '../../../redux/thunks/listingThunks';
import styles from './RestaurantDetails.module.css';
import Header from "../../Header/Header";
import ListingModel from "../components/addListingModel/ListingModel.tsx";
import RestaurantInfo from "../components/restaurantDetails/RestaurantInfo.tsx";
import RestaurantListings from "../components/restaurantListings/RestaurantListings.tsx";
import Orders from "../components/Orders/Orders.tsx";
import {removeRestaurant} from "../../../redux/thunks/restaurantThunk.ts";



const RestaurantDetails: React.FC = () => {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const dispatch = useDispatch();

    const { ownedRestaurants } = useSelector((state: RootState) => state.restaurant);
    const { listings, loading: listingsLoading } = useSelector((state: RootState) => state.listing);

    const [isAddListingModalOpen, setIsAddListingModalOpen] = useState(false);

    const restaurant = ownedRestaurants.find(
        (restaurant) => restaurant.id === Number(restaurantId)
    );

    // Effects
    useEffect(() => {
        if (restaurantId) {
            dispatch(fetchRestaurantPurchases(Number(restaurantId)));
            dispatch(getListings({ restaurantId: Number(restaurantId) }));
        }
    }, [dispatch, restaurantId]);




    const handleCloseModal = () => {
        setIsAddListingModalOpen(false);
        dispatch(getListings({ restaurantId: Number(restaurantId) }));
    };

    if (!restaurant) {
        return (
            <>
                <Header/>
                <div className={styles.container}><p>Restaurant not found.</p></div>
            </>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <Header />
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.detailsColumn}>
                        <RestaurantInfo
                            restaurant={restaurant}
                            onAddListing={() => setIsAddListingModalOpen(true)}
                        />

                        <RestaurantListings
                            listings={listings}
                            loading={listingsLoading}
                            restaurantId={Number(restaurantId)}
                        />
                    </div>

                    <div className={styles.purchasesColumn}>
                        <Orders
                            restaurantId={Number(restaurantId)}

                        />
                    </div>
                </div>
            </div>

            {/* Add Listing Modal */}
            <Modal
                open={isAddListingModalOpen}
                onClose={handleCloseModal}
                className={styles.modalWrapper}
                disableAutoFocus
            >
                <div className={styles.modalContainer}>
                    <ListingModel
                        restaurantId={Number(restaurantId)}
                        onClose={handleCloseModal}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default RestaurantDetails;