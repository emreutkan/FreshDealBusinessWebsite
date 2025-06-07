import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
vi.mock('../redux/slices/userSlice.ts', () => ({ logout: vi.fn() }));
import { getVapidPublicKeyAPI, subscribeWebPushAPI, sendTestNotificationAPI } from '../redux/Api/NotificationApi.ts';

vi.mock('axios');

const mockedAxios = axios as unknown as { get: any; post: any };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('NotificationApi', () => {
  it('gets VAPID public key', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: 'key' });
    await expect(getVapidPublicKeyAPI()).resolves.toBe('key');
    expect(mockedAxios.get).toHaveBeenCalled();
  });

  it('subscribes to web push', async () => {
    const subscription = { toJSON: () => ({ sub: true }) } as any;
    mockedAxios.post = vi.fn().mockResolvedValue({ data: 'ok' });
    await expect(subscribeWebPushAPI(subscription, 't')).resolves.toBe('ok');
    expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('/subscribe'), { subscription: { sub: true } }, expect.any(Object));
  });

  it('sends test notification', async () => {
    mockedAxios.post = vi.fn().mockResolvedValue({ data: 'ok' });
    await expect(sendTestNotificationAPI('t')).resolves.toBe('ok');
    expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('/test'), {}, expect.any(Object));
  });
});
