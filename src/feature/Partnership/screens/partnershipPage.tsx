import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import styles from "./partnershipPage.module.css";
import { IoArrowBack } from "react-icons/io5";
import AddBusinessModel from "../components/addBusinessModel/addBusinessModel.tsx";
import {Restaurant} from "../../../redux/slices/restaurantSlice.ts";

interface LocationState {
    isEditing?: boolean;
    restaurant?: Restaurant; // Replace 'any' with your Restaurant type
}

const PartnershipPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isEditing, restaurant } = location.state as LocationState || {};
    const [isExiting, setIsExiting] = useState(false);

    const handleGoBack = () => {
        setIsExiting(true);
        setTimeout(() => {
            navigate(-1);
        }, 300);
    };

    return (
        <div className={`${styles.pageWrapper} ${isExiting ? styles.exitAnimation : ''}`}>
            <div className={styles.backgroundPattern}>
                <div className={styles.circle1}></div>
                <div className={styles.circle2}></div>
                <div className={styles.circle3}></div>
            </div>

            <div className={styles.pageContainer}>
                <div className={styles.headerSection}>
                    <Button
                        onClick={handleGoBack}
                        className={styles.backButton}
                        startIcon={<IoArrowBack />}
                    >
                        Back
                    </Button>
                    {restaurant ? (
                        <div className={styles.restaurantInfo}>
                            <img
                                src={restaurant.image_url}
                                alt={restaurant.restaurantName}
                                className={styles.restaurantImage}
                            />
                            <div className={styles.restaurantDetails}>
                                <h1>{restaurant.restaurantName}</h1>
                                <p className={styles.category}>{restaurant.category}</p>
                                <p className={styles.timestamp}>
                                    {new Date().toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.welcomeMessage}>
                            <h1>Join FreshDeal</h1>
                            <p>Partner with us and reach more customers</p>
                        </div>
                    )}
                </div>

                <div className={styles.contentContainer}>
                    <div className={styles.formWrapper}>
                        <AddBusinessModel isEditing={isEditing} restaurant={restaurant} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnershipPage;