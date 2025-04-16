import React from 'react';
import { useParams } from 'react-router-dom';

import styles from './RestaurantDetails.module.css';
import Header from "../../Header/Header";
import RestaurantInfo from "../components/restaurantDetails/RestaurantInfo.tsx";
import RestaurantListings from "../components/restaurantListings/RestaurantListings.tsx";
import Orders from "../components/Orders/Orders.tsx";



const RestaurantDetails: React.FC = () => {
    const { restaurantId } = useParams<{ restaurantId: string }>();

    return (
        <div className={styles.pageWrapper}>
            <Header />
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.detailsColumn}>
                        <RestaurantInfo
                            restaurantId={restaurantId}

                        />

                        {restaurantId && (
                            <RestaurantListings
                                restaurantId={restaurantId}
                            />
                        )}

                    </div>

                    <div className={styles.purchasesColumn}>
                        <Orders
                            restaurantId={Number(restaurantId)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantDetails;