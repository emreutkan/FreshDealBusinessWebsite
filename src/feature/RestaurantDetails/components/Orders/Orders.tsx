import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Orders.module.css';
import {
    fetchRestaurantPurchases,
    acceptPurchaseOrder,
    addCompletionImage,
    rejectPurchaseOrder
} from '../../../../redux/thunks/purchaseThunks.ts';
import { AppDispatch, RootState } from "../../../../redux/store.ts";
import { Purchase } from "../../../../redux/slices/purchaseSlice.ts";

// Modal Component
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{title}</h2>
                    <button className={styles.modalClose} onClick={onClose}>×</button>
                </div>
                {children}
            </div>
        </div>
    );
};

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
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

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

    useEffect(() => {
        if (restaurantId) {
            dispatch(fetchRestaurantPurchases(Number(restaurantId)));
        }
    }, [dispatch, restaurantId]);


    const [rejectingOrder, setRejectingOrder] = useState<number | null>(null);

    const handleRejectOrder = async (purchaseId: number) => {
        if (!purchaseId) {
            console.error('Purchase ID is undefined');
            return;
        }

        if (!window.confirm('Are you sure you want to reject this order?')) {
            return;
        }

        setRejectingOrder(purchaseId);
        try {
            console.log('Rejecting order:', purchaseId);
            const result = await dispatch(rejectPurchaseOrder(purchaseId)).unwrap();
            console.log('Reject order result:', result);
            await dispatch(fetchRestaurantPurchases(restaurantId));
        } catch (error) {
            console.error('Failed to reject order:', error);
        } finally {
            setRejectingOrder(null);
        }
    };

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
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
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
            const result = await dispatch(addCompletionImage({
                purchaseId,
                file: selectedFile
            })).unwrap();

            console.log('Upload result:', result);
            setSelectedFile(null);
            setActiveImageUpload(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            await dispatch(fetchRestaurantPurchases(restaurantId));
        } catch (error) {
            console.error('Failed to upload image:', error);
        }
    };

    const groupPurchasesByStatus = (purchases: Purchase[]) => {
        return {
            pending: purchases.filter(p => p.status === 'PENDING'),
            accepted: purchases.filter(p => p.status === 'ACCEPTED'),
            completed: purchases.filter(p => p.status === 'COMPLETED'),
            rejected: purchases.filter(p => p.status === 'REJECTED')
        };
    };

    const renderPurchaseItem = (purchase: Purchase) => (
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

            {purchase.status === 'PENDING' && (
                <div className={styles.purchaseActions}>
                    <button
                        className={styles.acceptButton}
                        onClick={() => handleAcceptOrder(purchase.purchase_id)}
                        disabled={acceptingOrder === purchase.purchase_id}
                    >
                        {acceptingOrder === purchase.purchase_id ? 'Accepting...' : 'Accept Order'}
                    </button>
                    <button
                        className={styles.rejectButton}
                        onClick={() => handleRejectOrder(purchase.purchase_id)}
                        disabled={rejectingOrder === purchase.purchase_id}
                    >
                        {rejectingOrder === purchase.purchase_id ? 'Rejecting...' : 'Reject Order'}
                    </button>
                </div>
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

            {purchase.completion_image_url && (
                <div className={styles.imageContainer}>
                    <img
                        src={purchase.completion_image_url}
                        alt="Order completion"
                        className={styles.completionImage}
                    />
                </div>
            )}
        </div>
    );

    return (
        <div className={styles.purchasesCard}>
            <h2>Restaurant Orders</h2>
            {loading && <p className={styles.loading}>Loading orders...</p>}
            {error && <p className={styles.error}>{error}</p>}

            {!loading && Array.isArray(purchases) && (
                <div className={styles.statusLists}>
                    {/* Pending Orders Section */}
                    <div className={styles.statusSection}>
                        <div className={styles.statusHeader}>
                            <h3 className={styles.statusTitle}>Pending Orders</h3>
                            <button
                                className={styles.expandButton}
                                onClick={() => setExpandedSection('pending')}
                            >
                                ⤢
                            </button>
                        </div>
                        <div className={styles.statusList}>
                            {groupPurchasesByStatus(purchases).pending.map(purchase => renderPurchaseItem(purchase))}
                        </div>
                    </div>

                    {/* Accepted Orders Section */}
                    <div className={styles.statusSection}>
                        <div className={styles.statusHeader}>
                            <h3 className={styles.statusTitle}>Accepted Orders</h3>
                            <button
                                className={styles.expandButton}
                                onClick={() => setExpandedSection('accepted')}
                            >
                                ⤢
                            </button>
                        </div>
                        <div className={styles.statusList}>
                            {groupPurchasesByStatus(purchases).accepted.map(purchase => renderPurchaseItem(purchase))}
                        </div>
                    </div>

                    {/* Completed Orders Section */}
                    <div className={styles.statusSection}>
                        <div className={styles.statusHeader}>
                            <h3 className={styles.statusTitle}>Completed Orders</h3>
                            <button
                                className={styles.expandButton}
                                onClick={() => setExpandedSection('completed')}
                            >
                                ⤢
                            </button>
                        </div>
                        <div className={styles.statusList}>
                            {groupPurchasesByStatus(purchases).completed.map(purchase => renderPurchaseItem(purchase))}
                        </div>
                    </div>

                    {/* Rejected Orders Section */}
                    <div className={styles.statusSection}>
                        <div className={styles.statusHeader}>
                            <h3 className={styles.statusTitle}>Rejected Orders</h3>
                            <button
                                className={styles.expandButton}
                                onClick={() => setExpandedSection('rejected')}
                            >
                                ⤢
                            </button>
                        </div>
                        <div className={styles.statusList}>
                            {groupPurchasesByStatus(purchases).rejected.map(purchase => renderPurchaseItem(purchase))}
                        </div>
                    </div>

                    {/* Modals */}
                    <Modal
                        isOpen={expandedSection === 'pending'}
                        onClose={() => setExpandedSection(null)}
                        title="Pending Orders"
                    >
                        <div className={styles.modalList}>
                            {groupPurchasesByStatus(purchases).pending.map(purchase => renderPurchaseItem(purchase))}
                        </div>
                    </Modal>

                    <Modal
                        isOpen={expandedSection === 'accepted'}
                        onClose={() => setExpandedSection(null)}
                        title="Accepted Orders"
                    >
                        <div className={styles.modalList}>
                            {groupPurchasesByStatus(purchases).accepted.map(purchase => renderPurchaseItem(purchase))}
                        </div>
                    </Modal>

                    <Modal
                        isOpen={expandedSection === 'completed'}
                        onClose={() => setExpandedSection(null)}
                        title="Completed Orders"
                    >
                        <div className={styles.modalList}>
                            {groupPurchasesByStatus(purchases).completed.map(purchase => renderPurchaseItem(purchase))}
                        </div>
                    </Modal>

                    <Modal
                        isOpen={expandedSection === 'rejected'}
                        onClose={() => setExpandedSection(null)}
                        title="Rejected Orders"
                    >
                        <div className={styles.modalList}>
                            {groupPurchasesByStatus(purchases).rejected.map(purchase => renderPurchaseItem(purchase))}
                        </div>
                    </Modal>
                </div>
            )}

            {!loading && (!purchases || purchases.length === 0) && (
                <div className={styles.noOrders}>
                    No orders found for this restaurant
                </div>
            )}
        </div>
    );
};

export default Orders;