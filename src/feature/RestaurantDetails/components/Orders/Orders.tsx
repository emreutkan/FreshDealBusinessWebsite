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
    restaurantId: string;
}

const Orders: React.FC<OrdersProps> = ({ restaurantId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [activeImageUpload, setActiveImageUpload] = useState<number | null>(null);
    const [acceptingOrder, setAcceptingOrder] = useState<number | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [rejectingOrder, setRejectingOrder] = useState<number | null>(null);

    const { items: purchases, loading, error } = useSelector((state: RootState) => state.purchases);

    const formatPrice = (price: string) => {
        return `${parseFloat(price).toFixed(2)} TL`;
    };

    useEffect(() => {
        if (restaurantId) {
            dispatch(fetchRestaurantPurchases(Number(restaurantId)));
        }
    }, [dispatch, restaurantId]);

    useEffect(() => {
        if (restaurantId) {
            const intervalId = setInterval(() => {
                dispatch(fetchRestaurantPurchases(Number(restaurantId)));
            }, 30000);
            return () => clearInterval(intervalId);
        }
    }, [dispatch, restaurantId]);

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
            await dispatch(rejectPurchaseOrder(purchaseId)).unwrap();
            await dispatch(fetchRestaurantPurchases(Number(restaurantId)));
        } catch (error) {
            console.error('Failed to reject order:', error);
        } finally {
            setRejectingOrder(null);
        }
    };

    const handleAcceptOrder = async (purchaseId: number) => {
        if (!purchaseId) {
            console.error('Purchase ID is undefined');
            return;
        }

        setAcceptingOrder(purchaseId);
        try {
            await dispatch(acceptPurchaseOrder(purchaseId)).unwrap();
            await dispatch(fetchRestaurantPurchases(Number(restaurantId)));
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
            await dispatch(addCompletionImage({
                purchaseId,
                file: selectedFile
            })).unwrap();
            setSelectedFile(null);
            setActiveImageUpload(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            await dispatch(fetchRestaurantPurchases(Number(restaurantId)));
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

    const renderStatusSection = (status: string, orders: Purchase[]) => {
        const statusLabels = {
            'PENDING': { title: 'Pending Orders', color: '#f59e0b' },
            'ACCEPTED': { title: 'Accepted Orders', color: '#3b82f6' },
            'COMPLETED': { title: 'Completed Orders', color: '#10b981' },
            'REJECTED': { title: 'Rejected Orders', color: '#ef4444' }
        };

        const currentLabel = statusLabels[status as keyof typeof statusLabels];

        return (
            <div className={styles.statusSection}>
                <div
                    className={styles.statusHeader}
                    style={{
                        borderLeft: `4px solid ${currentLabel.color}`,
                        background: `linear-gradient(to right, ${currentLabel.color}10, transparent)`
                    }}
                >
                    <div className={styles.statusHeaderContent}>
                        <h3 className={styles.statusTitle}>
                            {currentLabel.title}
                            <span className={styles.orderCount}>
                                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                            </span>
                        </h3>
                        <button
                            className={styles.expandButton}
                            onClick={() => setExpandedSection(status.toLowerCase())}
                            title="Expand section"
                        >
                            <span className={styles.expandIcon}>⤢</span>
                        </button>
                    </div>
                </div>
                <div className={styles.statusList}>
                    {orders.length > 0 ? (
                        orders.map(purchase => renderPurchaseItem(purchase))
                    ) : (
                        <div className={styles.emptyState}>
                            No {status.toLowerCase()} orders
                        </div>
                    )}
                </div>
            </div>
        );
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
        <div className={styles.purchasesContainer}>
            <div className={styles.purchasesHeader}>
                <h2>Restaurant Orders</h2>
                {loading && <div className={styles.loadingIndicator}>Loading...</div>}
            </div>

            {error && (
                <div className={styles.errorContainer}>
                    <p className={styles.errorMessage}>{error}</p>
                </div>
            )}

            {!loading && Array.isArray(purchases) && (
                <div className={styles.statusGrid}>
                    {renderStatusSection('PENDING', groupPurchasesByStatus(purchases).pending)}
                    {renderStatusSection('ACCEPTED', groupPurchasesByStatus(purchases).accepted)}
                    {renderStatusSection('COMPLETED', groupPurchasesByStatus(purchases).completed)}
                    {renderStatusSection('REJECTED', groupPurchasesByStatus(purchases).rejected)}
                </div>
            )}

            <Modal
                isOpen={expandedSection === 'pending'}
                onClose={() => setExpandedSection(null)}
                title="Pending Orders"
            >
                <div className={styles.modalList}>
                    {groupPurchasesByStatus(purchases).pending.map(purchase =>
                        renderPurchaseItem(purchase)
                    )}
                </div>
            </Modal>

            <Modal
                isOpen={expandedSection === 'accepted'}
                onClose={() => setExpandedSection(null)}
                title="Accepted Orders"
            >
                <div className={styles.modalList}>
                    {groupPurchasesByStatus(purchases).accepted.map(purchase =>
                        renderPurchaseItem(purchase)
                    )}
                </div>
            </Modal>

            <Modal
                isOpen={expandedSection === 'completed'}
                onClose={() => setExpandedSection(null)}
                title="Completed Orders"
            >
                <div className={styles.modalList}>
                    {groupPurchasesByStatus(purchases).completed.map(purchase =>
                        renderPurchaseItem(purchase)
                    )}
                </div>
            </Modal>

            <Modal
                isOpen={expandedSection === 'rejected'}
                onClose={() => setExpandedSection(null)}
                title="Rejected Orders"
            >
                <div className={styles.modalList}>
                    {groupPurchasesByStatus(purchases).rejected.map(purchase =>
                        renderPurchaseItem(purchase)
                    )}
                </div>
            </Modal>

            {!loading && (!purchases || purchases.length === 0) && (
                <div className={styles.noOrders}>
                    No orders found for this restaurant
                </div>
            )}
        </div>
    );
};

export default Orders;