import {getVapidPublicKeyAPI, subscribeWebPushAPI} from '../redux/Api/NotificationApi.ts'

export class NotificationService {
    private static instance: NotificationService;
    private vapidPublicKey: string | null = null;

    private constructor() {}

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    async initialize(): Promise<void> {
        if (!('Notification' in window)) {
            throw new Error('This browser does not support notifications');
        }

        if (!('serviceWorker' in navigator)) {
            throw new Error('Service Worker is not supported in this browser');
        }

        try {
            const response = await getVapidPublicKeyAPI();
            this.vapidPublicKey = response.publicKey;
        } catch (error) {
            console.error('Failed to fetch VAPID public key:', error);
            throw error;
        }
    }

    async requestPermission(): Promise<boolean> {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
        return await navigator.serviceWorker.register('/service-worker.js');
    }

    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    async subscribeToPushNotifications(token: string): Promise<void> {
        if (!this.vapidPublicKey) {
            throw new Error('VAPID public key not initialized');
        }

        const permission = await this.requestPermission();
        if (!permission) {
            throw new Error('Notification permission denied');
        }

        const registration = await this.registerServiceWorker();
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey
            });
        }

        await subscribeWebPushAPI(subscription, token);
        return;
    }
}