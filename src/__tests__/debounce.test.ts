import { vi, describe, it, expect } from 'vitest';
import { debounce } from '../utils/debounce.ts';

describe('debounce', () => {
  it('delays function execution', async () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 50);
    debounced();
    debounced();
    expect(fn).not.toHaveBeenCalled();
    await new Promise(r => setTimeout(r, 60));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
