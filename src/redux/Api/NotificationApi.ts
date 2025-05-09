import axios from 'axios';
import {API_BASE_URL} from "./apiService.ts";

const WEB_PUSH_ENDPOINT = `${API_BASE_URL}/web-push`;

export const getVapidPublicKeyAPI = async () => {
    const response = await axios.get(`${WEB_PUSH_ENDPOINT}/vapid-public-key`);
    return response.data;
};

export const subscribeWebPushAPI = async (subscription: PushSubscription, token: string) => {
    const response = await axios.post(
        `${WEB_PUSH_ENDPOINT}/subscribe`,
        { subscription: subscription.toJSON() },
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data;
};

export const sendTestNotificationAPI = async (token: string) => {
    const response = await axios.post(
        `${WEB_PUSH_ENDPOINT}/test`,
        {},
        {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        }
    );
    return response.data;
};