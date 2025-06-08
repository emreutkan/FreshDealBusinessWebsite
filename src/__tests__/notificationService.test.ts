import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService } from '../services/notificationService.ts';
vi.mock('../redux/slices/userSlice.ts', () => ({ logout: vi.fn() }));
import * as api from '../redux/Api/NotificationApi.ts';

vi.mock('../redux/Api/NotificationApi.ts');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('NotificationService', () => {
  it('returns singleton instance', () => {
    const a = NotificationService.getInstance();
    const b = NotificationService.getInstance();
    expect(a).toBe(b);
  });

  it('converts base64 to Uint8Array', () => {
    const service = NotificationService.getInstance() as any;
    const result = service['urlBase64ToUint8Array']('AQAB');
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBeGreaterThan(0);
  });

  it('subscribes to push notifications', async () => {
    const service = NotificationService.getInstance() as any;
    service.vapidPublicKey = 'AA';

    vi.spyOn(service, 'requestPermission').mockResolvedValue(true);
    const subscribe = vi.fn().mockResolvedValue('sub');
    const registration = {
      pushManager: {
        getSubscription: vi.fn().mockResolvedValue(null),
        subscribe
      }
    } as any;
    vi.spyOn(service, 'registerServiceWorker').mockResolvedValue(registration);
    (api.subscribeWebPushAPI as any).mockResolvedValue('ok');

    await service.subscribeToPushNotifications('token');
    expect(subscribe).toHaveBeenCalled();
    expect(api.subscribeWebPushAPI).toHaveBeenCalledWith('sub', 'token');
  });
});
