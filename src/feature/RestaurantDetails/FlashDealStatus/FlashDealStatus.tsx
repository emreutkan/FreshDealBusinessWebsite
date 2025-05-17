import React, { useState } from 'react';
import styles from './FlashDealStatus.module.css';
import { useDispatch } from 'react-redux';
import { updateRestaurant } from '../../../redux/thunks/restaurantThunk';
import { AppDispatch } from '../../../redux/store';

interface FlashDealsStatusProps {
    restaurantId: string;
    isAvailable: boolean;
    count: number;
    maxCount?: number;
}

const FlashDealsStatus: React.FC<FlashDealsStatusProps> = ({
                                                               restaurantId,
                                                               isAvailable,
                                                               count,
                                                               maxCount = 3
                                                           }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentStatus, setCurrentStatus] = useState(isAvailable);

    const remaining = maxCount - count;
    const usagePercentage = (count / maxCount) * 100;

    const allUsed = count >= maxCount;

    const handleToggleFlashDeals = async () => {
        if (allUsed && !currentStatus) {
            setError("You've used all your flash deals. Cannot enable.");
            return;
        }

        setUpdating(true);
        setError(null);

        try {
            const newStatus = !currentStatus;
            await dispatch(updateRestaurant({
                restaurantId,
                flash_deals_available: newStatus
            } as any)).unwrap();

            setCurrentStatus(newStatus);
        } catch (err: any) {
            console.error('Failed to update flash deals status:', err);
            setError(err.message || 'Failed to update flash deals status');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
                <svg className={styles.boltIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.5 2.75L4.5 14.25H11.25L9.5 21.25L15.5 9.75H8.75L10.5 2.75Z" fill="currentColor"/>
                </svg>
            </div>
            <div className={styles.infoContent}>
                <h3>Flash Deals</h3>
                <p>Status: <span className={currentStatus ? styles.statusActive : styles.statusInactive}>
                    {currentStatus ? 'Active' : 'Inactive'}
                </span></p>
                <div className={styles.progressContainer}>
                    <div
                        className={styles.progressBar}
                        style={{
                            width: `${usagePercentage}%`,
                            backgroundColor: currentStatus
                                ? (remaining > 0 ? '#4caf50' : '#f44336')
                                : '#9e9e9e'
                        }}
                    ></div>
                </div>
                <p className={styles.subInfo}>
                    {remaining > 0
                        ? `${count} of ${maxCount} used (${remaining} remaining)`
                        : `All ${maxCount} flash deals used`
                    }
                </p>
                {error && <p className={styles.errorMessage}>{error}</p>}
                <button
                    onClick={handleToggleFlashDeals}
                    className={styles.toggleButton}
                    disabled={updating || (allUsed && !currentStatus)}
                >
                    {updating ? 'Updating...' : currentStatus ? 'Disable' : 'Enable'}
                </button>
            </div>
        </div>
    );
};

export default FlashDealsStatus;