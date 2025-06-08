import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStoredToken, setStoredToken, removeStoredToken, getAuthHeaders, authenticatedApiCall, TOKEN_KEY } from '../redux/Api/apiService.ts';
vi.mock('../redux/slices/userSlice.ts', () => ({ logout: vi.fn() }));

const dispatch = vi.fn();

describe('apiService utility functions', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('stores and retrieves token from localStorage', () => {
    setStoredToken('abc');
    expect(localStorage.getItem(TOKEN_KEY)).toBe('abc');
    expect(getStoredToken()).toBe('abc');
  });

  it('removes stored token', () => {
    localStorage.setItem(TOKEN_KEY, 'token');
    removeStoredToken();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('returns auth headers for JSON requests', () => {
    localStorage.setItem(TOKEN_KEY, 't');
    expect(getAuthHeaders()).toEqual({
      'Authorization': 'Bearer t',
      'Content-Type': 'application/json'
    });
  });

  it('throws if no token when getting headers', () => {
    expect(() => getAuthHeaders()).toThrow('No authentication token found');
  });

  it('calls fetch with provided options in authenticatedApiCall', async () => {
    localStorage.setItem(TOKEN_KEY, 'tok');
    const mockResponse = { ok: true, json: vi.fn().mockResolvedValue({ foo: 'bar' }), status: 200 } as Response;
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
    const result = await authenticatedApiCall('http://test', { method: 'GET' }, dispatch);
    expect(fetchSpy).toHaveBeenCalled();
    expect(result).toEqual({ foo: 'bar' });
  });
});
