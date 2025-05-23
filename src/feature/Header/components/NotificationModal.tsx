import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { API_BASE_URL } from '../../../redux/Api/apiService';
import styles from './NotificationModal.module.css';

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
    const [status, setStatus] = useState<'default' | 'granted' | 'denied'>('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const token = useSelector((state: RootState) => state.user.token);

    useEffect(() => {
        if ('Notification' in window) {
            setStatus(Notification.permission);
        }
    }, []);

    useEffect(() => {
        // Check subscription status when modal opens
        if (isOpen) {
            checkSubscriptionStatus();
        }
    }, [isOpen]);

    const checkSubscriptionStatus = async () => {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                setIsSubscribed(!!subscription);
            } catch (error) {
                console.error('Error checking subscription status:', error);
            }
        }
    };

    const registerServiceWorker = async () => {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
            return registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            throw error;
        }
    };

    const urlBase64ToUint8Array = (base64String: string) => {
        // Check if the key is in PEM format
        if (base64String.startsWith('MF')) {
            try {
                const rawBinary = atob(base64String);
                const extractedKey = rawBinary.slice(-65);
                const uint8Array = new Uint8Array(extractedKey.length);
                for (let i = 0; i < extractedKey.length; i++) {
                    uint8Array[i] = extractedKey.charCodeAt(i);
                }
                return uint8Array;
            } catch (e) {
                throw new Error('Failed to convert applicationServerKey from PEM format');
            }
        }

        // Standard URL-safe base64 processing
        let normalizedBase64 = base64String
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        // Add padding if needed
        const paddingNeeded = normalizedBase64.length % 4;
        if (paddingNeeded > 0) {
            normalizedBase64 += '='.repeat(4 - paddingNeeded);
        }

        try {
            const binaryString = atob(normalizedBase64);
            const uint8Array = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                uint8Array[i] = binaryString.charCodeAt(i);
            }
            return uint8Array;
        } catch (e) {
            throw new Error(`Failed to convert applicationServerKey: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
    };

    const subscribeToNotifications = async () => {
        if (!token) {
            setError('You must be logged in to enable notifications');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const permission = await Notification.requestPermission();
            setStatus(permission);

            if (permission !== 'granted') {
                throw new Error('Notification permission denied');
            }

            const registration = await registerServiceWorker();
            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                const response = await fetch(`${API_BASE_URL}/web-push/vapid-public-key`);

                if (!response.ok) {
                    throw new Error('Failed to fetch VAPID key');
                }

                const responseData = await response.json();
                const { publicKey } = responseData;

                if (!publicKey) {
                    throw new Error('Invalid VAPID key received from server');
                }

                try {
                    const applicationServerKey = urlBase64ToUint8Array(publicKey);
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey
                    });
                } catch (subError) {
                    throw new Error(`Failed to subscribe: ${subError instanceof Error ? subError.message : 'Unknown error'}`);
                }
            }

            const subscribeResponse = await fetch(`${API_BASE_URL}/web-push/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ subscription: subscription.toJSON() })
            });

            if (!subscribeResponse.ok) {
                throw new Error('Failed to register subscription with server');
            }

            setIsSubscribed(true);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to subscribe to notifications');
            setIsSubscribed(false);
        } finally {
            setIsLoading(false);
        }
    };

    const sendTestNotification = async () => {
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/web-push/test`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to send test notification');
            }
        } catch (error) {
            setError('Failed to send test notification');
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>Notification Status</h3>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div className={styles.statusContainer}>
                    <p>Permission: {status}</p>
                    <p>Subscribed: {isSubscribed ? 'Yes' : 'No'}</p>
                </div>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                <div className={styles.actions}>
                    <button
                        onClick={subscribeToNotifications}
                        disabled={isLoading || isSubscribed}
                        className={styles.button}
                    >
                        {isLoading ? 'Enabling...' : 'Enable Notifications'}
                    </button>

                    {isSubscribed && (
                        <button
                            onClick={sendTestNotification}
                            className={`${styles.button} ${styles.testButton}`}
                        >
                            Send Test Notification
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;