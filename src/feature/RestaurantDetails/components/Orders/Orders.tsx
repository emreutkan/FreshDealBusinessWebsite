import React, { useState, useEffect, useRef,  } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Orders.module.css';
import { fetchRestaurantPurchases, acceptPurchaseOrder, addCompletionImage } from '../../../../redux/thunks/purchaseThunks.ts';
import { AppDispatch, RootState } from "../../../../redux/store.ts";
import {Purchase} from "../../../../redux/slices/purchaseSlice.ts";

// Utility function for date formatting
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};


interface OrdersProps {
    restaurantId: number;
}

const Orders: React.FC<OrdersProps> = ({ restaurantId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [activeImageUpload, setActiveImageUpload] = useState<number | null>(null);
    const [acceptingOrder, setAcceptingOrder] = useState<number | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get orders from Redux store
    const { items: purchases, loading, error } = useSelector((state: RootState) => {
        const purchasesState = state.purchases;
        console.log('Redux purchases state:', purchasesState);
        return purchasesState;
    });

    // Utility function for formatting price
    const formatPrice = (price: string) => {
        return `$${parseFloat(price).toFixed(2)}`;
    };

    // Function to get status-specific className
    const getStatusClassName = (status: Purchase['status']) => {
        switch (status) {
            case 'PENDING':
                return styles.pending;
            case 'ACCEPTED':
                return styles.accepted;
            case 'COMPLETED':
                return styles.completed;
            case 'REJECTED':
                return styles.rejected;
            default:
                return '';
        }
    };

    useEffect(() => {
        if (restaurantId) {
            console.log('Fetching orders for restaurant:', restaurantId);
            dispatch(fetchRestaurantPurchases(restaurantId));
        }
    }, [dispatch, restaurantId]);

    // Set up polling for order updates (every 30 seconds)
    useEffect(() => {
        if (restaurantId) {
            const intervalId = setInterval(() => {
                dispatch(fetchRestaurantPurchases(restaurantId));
            }, 30000);

            return () => clearInterval(intervalId);
        }
    }, [dispatch, restaurantId]);

    const handleAcceptOrder = async (purchaseId: number) => {
        if (!purchaseId) {
            console.error('Purchase ID is undefined');
            return;
        }

        setAcceptingOrder(purchaseId);
        try {
            console.log('Accepting order:', purchaseId);
            const result = await dispatch(acceptPurchaseOrder(purchaseId)).unwrap();
            console.log('Accept order result:', result);
            await dispatch(fetchRestaurantPurchases(restaurantId));
        } catch (error) {
            console.error('Failed to accept order:', error);
        } finally {
            setAcceptingOrder(null);
        }
    };
    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Debug log
            console.log('Selected file:', {
                name: file.name,
                type: file.type,
                size: file.size
            });

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            // Validate file size (e.g., max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleImageUpload = async (purchaseId: number) => {
        if (!selectedFile) {
            alert('Please select an image first');
            return;
        }

        try {
            // Debug log
            console.log('Starting upload for:', {
                purchaseId,
                fileName: selectedFile.name,
                fileType: selectedFile.type,
                fileSize: selectedFile.size
            });

            const result = await dispatch(addCompletionImage({
                purchaseId,
                file: selectedFile
            })).unwrap();

            console.log('Upload result:', result);

            // Reset states after successful upload
            setSelectedFile(null);
            setActiveImageUpload(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            // Refresh orders
            await dispatch(fetchRestaurantPurchases(restaurantId));
        } catch (error) {
            console.error('Failed to upload image:', error);
            alert(error.message || 'Failed to upload image. Please try again.');
        }
    };


    return (
        <div className={styles.purchasesCard}>
            <h2>Restaurant Orders</h2>
            {loading && <p className={styles.loading}>Loading orders...</p>}
            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.purchasesList}>
                {Array.isArray(purchases) && purchases.map(purchase => (
                    <div
                        key={purchase.purchase_id}
                        className={`${styles.purchaseItem} ${getStatusClassName(purchase.status)}`}
                    >
                        <div className={styles.purchaseHeader}>
                            <span className={styles.orderId}>Order #{purchase.purchase_id}</span>
                            <span className={styles.status}>{purchase.status}</span>
                            <span className={styles.date}>
                                {formatDate(purchase.purchase_date)}
                            </span>
                        </div>

                        <div className={styles.orderDetails}>
                            <div className={styles.itemTitle}>
                                {purchase.listing_title} x {purchase.quantity}
                            </div>
                            <div className={styles.totalPrice}>
                                {formatPrice(purchase.total_price)}
                            </div>
                        </div>

                        {purchase.is_delivery && purchase.delivery_address && (
                            <div className={styles.deliveryInfo}>
                                <strong>Delivery Address:</strong>
                                <p>{purchase.delivery_address}</p>
                                {purchase.delivery_notes && (
                                    <>
                                        <strong>Delivery Notes:</strong>
                                        <p>{purchase.delivery_notes}</p>
                                    </>
                                )}
                            </div>
                        )}

                        {purchase.completion_image_url && (
                            <div className={styles.imageContainer}>
                                <img
                                    src={purchase.completion_image_url}
                                    alt="Order completion"
                                    className={styles.completionImage}
                                />
                            </div>
                        )}

                        <div className={styles.purchaseActions}>
                            {purchase.status === 'PENDING' && (
                                <button
                                    className={styles.acceptButton}
                                    onClick={() => handleAcceptOrder(purchase.purchase_id)}
                                    disabled={acceptingOrder === purchase.purchase_id}
                                >
                                    {acceptingOrder === purchase.purchase_id ? 'Accepting...' : 'Accept Order'}
                                </button>
                            )}

                            {purchase.status === 'ACCEPTED' && !purchase.completion_image_url && (
                                <div className={styles.imageUploadSection}>
                                    {activeImageUpload === purchase.purchase_id ? (
                                        <div className={styles.imageUploadControls}>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                capture="environment"
                                                onChange={handleImageSelect}
                                                className={styles.fileInput}
                                                id={`file-input-${purchase.purchase_id}`}
                                            />
                                            <label
                                                htmlFor={`file-input-${purchase.purchase_id}`}
                                                className={styles.fileInputLabel}
                                            >
                                                {selectedFile ? selectedFile.name : 'Choose Image or Take Photo'}
                                            </label>

                                            {selectedFile && (
                                                <div className={styles.imagePreview}>
                                                    <img
                                                        src={URL.createObjectURL(selectedFile)}
                                                        alt="Preview"
                                                        className={styles.previewImage}
                                                    />
                                                </div>
                                            )}

                                            <div className={styles.uploadButtons}>
                                                <button
                                                    className={styles.uploadButton}
                                                    onClick={() => handleImageUpload(purchase.purchase_id)}
                                                    disabled={!selectedFile}
                                                >
                                                    Upload Image
                                                </button>
                                                <button
                                                    className={styles.cancelButton}
                                                    onClick={() => {
                                                        setActiveImageUpload(null);
                                                        setSelectedFile(null);
                                                        if (fileInputRef.current) {
                                                            fileInputRef.current.value = '';
                                                        }
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            className={styles.addImageButton}
                                            onClick={() => setActiveImageUpload(purchase.purchase_id)}
                                        >
                                            Add Completion Image
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {!loading && (!purchases || purchases.length === 0) && (
                    <div className={styles.noOrders}>
                        No orders found for this restaurant
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;