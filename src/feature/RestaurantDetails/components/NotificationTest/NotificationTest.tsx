import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { API_BASE_URL } from '../../../../redux/Api/apiService';
import styles from './NotificationTest.module.css';

const NotificationTest: React.FC = () => {
    const [status, setStatus] = useState<'default' | 'granted' | 'denied'>('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const token = useSelector((state: RootState) => state.user.token);
    const dispatch = useDispatch();

    useEffect(() => {
        if ('Notification' in window) {
            setStatus(Notification.permission);
            console.log('Initial notification permission state:', Notification.permission);
        }
    }, []);

    const registerServiceWorker = async () => {
        try {
            console.log('Registering service worker...');
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('Service worker registered successfully');
            const subscription = await registration.pushManager.getSubscription();
            console.log('Current subscription status:', !!subscription);
            setIsSubscribed(!!subscription);
            return registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            throw error;
        }
    };

    const urlBase64ToUint8Array = (base64String: string) => {
        console.log('Converting base64 to Uint8Array. Raw input:', base64String);

        // 1. Check if the key is in PEM format (starts with MF...)
        if (base64String.startsWith('MF')) {
            console.log('Detected PEM format key, converting...');

            try {
                // 2. Convert from standard base64 to a raw binary string
                const rawBinary = atob(base64String);
                console.log('Length after standard base64 decode:', rawBinary.length);

                // 3. Extract key bits (65 bytes for P-256)
                const extractedKey = rawBinary.slice(-65);
                console.log('Extracted key length:', extractedKey.length);

                // 4. Convert the binary string to Uint8Array
                const uint8Array = new Uint8Array(extractedKey.length);
                for (let i = 0; i < extractedKey.length; i++) {
                    uint8Array[i] = extractedKey.charCodeAt(i);
                }

                console.log('Final Uint8Array length:', uint8Array.length);
                console.log('First few bytes:', Array.from(uint8Array.slice(0, 5)));

                return uint8Array;
            } catch (e) {
                console.error('Error converting PEM format key:', e);
                throw new Error('Failed to convert applicationServerKey from PEM format');
            }
        }

        // Standard URL-safe base64 processing for already correctly formatted keys
        let normalizedBase64 = base64String
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        // Add padding if needed
        const paddingNeeded = normalizedBase64.length % 4;
        if (paddingNeeded > 0) {
            normalizedBase64 += '='.repeat(4 - paddingNeeded);
        }

        console.log('Processed base64 string:', normalizedBase64);

        try {
            const binaryString = atob(normalizedBase64);
            console.log('Decoded binary string length:', binaryString.length);

            const uint8Array = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                uint8Array[i] = binaryString.charCodeAt(i);
            }

            console.log('Final Uint8Array length:', uint8Array.length);
            console.log('First few bytes:', Array.from(uint8Array.slice(0, 5)));

            return uint8Array;
        } catch (e) {
            console.error('Error in standard base64 conversion:', e);
            throw new Error('Failed to convert applicationServerKey: ' + e.message);
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
            console.log('Requesting notification permission...');
            const permission = await Notification.requestPermission();
            console.log('Permission response:', permission);
            setStatus(permission);

            if (permission !== 'granted') {
                throw new Error('Notification permission denied');
            }

            console.log('Registering service worker...');
            const registration = await registerServiceWorker();
            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                console.log('No existing subscription, fetching VAPID key...');
                const response = await fetch(`${API_BASE_URL}/web-push/vapid-public-key`);
                console.log('VAPID key response status:', response.status);

                if (!response.ok) {
                    throw new Error('Failed to fetch VAPID key');
                }

                const responseData = await response.json();
                console.log('VAPID key response data:', responseData);

                const { publicKey } = responseData;
                if (!publicKey) {
                    throw new Error('Invalid VAPID key received from server');
                }

                try {
                    const applicationServerKey = urlBase64ToUint8Array(publicKey);

                    console.log('Attempting to subscribe with converted key...');
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey
                    });
                    console.log('Subscription successful:', subscription);
                } catch (subError) {
                    console.error('Subscription error detail:', subError);
                    throw new Error(`Failed to subscribe: ${subError instanceof Error ? subError.message : 'Unknown error'}`);
                }
            }

            console.log('Sending subscription to server...');
            const subscribeResponse = await fetch(`${API_BASE_URL}/web-push/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ subscription: subscription.toJSON() })
            });
            console.log('Server response status:', subscribeResponse.status);

            if (!subscribeResponse.ok) {
                throw new Error('Failed to register subscription with server');
            }

            setIsSubscribed(true);
            setError(null);
            console.log('Subscription process completed successfully');
        } catch (err) {
            console.error('Subscription error:', err);
            setError(err instanceof Error ? err.message : 'Failed to subscribe to notifications');
            setIsSubscribed(false);
        } finally {
            setIsLoading(false);
        }
    };

    const sendTestNotification = async () => {
        if (!token) return;

        try {
            console.log('Sending test notification request...');
            const response = await fetch(`${API_BASE_URL}/web-push/test`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Test notification response status:', response.status);

            if (!response.ok) {
                throw new Error('Failed to send test notification');
            }
            console.log('Test notification sent successfully');
        } catch (error) {
            console.error('Test notification error:', error);
            setError('Failed to send test notification');
        }
    };

    return (
        <div className={styles.container}>
            <h3>Notification Status</h3>
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
    );
};

export default NotificationTest;