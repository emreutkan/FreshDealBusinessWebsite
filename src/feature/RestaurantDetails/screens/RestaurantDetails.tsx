import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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



const RestaurantDetails: React.FC = () => {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const dispatch = useDispatch();

    const { ownedRestaurants } = useSelector((state: RootState) => state.restaurant);
    const { items: purchases, loading: purchasesLoading, error: purchasesError } = useSelector((state: RootState) => state.purchases);
    const { listings, loading: listingsLoading } = useSelector((state: RootState) => state.listing);

    // State
    const [isAddListingModalOpen, setIsAddListingModalOpen] = useState(false);

    // Find current restaurant
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

    // Handlers
    const handleAcceptPurchase = async (purchaseId: number) => {
        try {
            await dispatch(acceptPurchaseOrder(purchaseId)).unwrap();
        } catch (error) {
            console.error('Failed to accept purchase:', error);
        }
    };

    const handleAddCompletionImage = async (purchaseId: number, imageUrl: string) => {
        try {
            await dispatch(addCompletionImage({ purchaseId, imageUrl })).unwrap();
        } catch (error) {
            console.error('Failed to upload image:', error);
        }
    };

    if (!restaurant) {

        console.log(restaurant)
        console.log(restaurantId)
        return (
            <>
                <Header/>
                <div className={styles.container}><p>Restaurant not found.</p></div>
            </>

        );
    }

    return (
        <div style={{
            backgroundColor: "rgb(231,231,231)",

        }}>
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
                        />
                    </div>

                    <div className={styles.purchasesColumn}>
                        <Orders
                            restaurantId={Number(restaurantId)}
                            purchases={purchases}
                            loading={purchasesLoading}
                            error={purchasesError}
                            onAcceptPurchase={handleAcceptPurchase}
                            onAddCompletionImage={handleAddCompletionImage}
                        />
                    </div>
                </div>
            </div>

            {/* Add Listing Modal */}
            {isAddListingModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <ListingModel
                            restaurantId={Number(restaurantId)}
                            onClose={() => {
                                setIsAddListingModalOpen(false);
                                dispatch(getListings({ restaurantId: Number(restaurantId) }));
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantDetails;