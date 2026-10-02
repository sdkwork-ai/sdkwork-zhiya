import { describe, expect, it } from 'vitest';

import { cx, formatCount, formatDateTime, formatPrice, trimPrice } from '../src/utils/format.js';
import { qrModuleCount } from '../src/components/VoucherQr.js';

describe('zhiya commons formatting', () => {
  it('formats_prices_without_trailing_zeros', () => {
    expect(formatPrice(19)).toBe('¥19');
    expect(formatPrice(29.9)).toBe('¥29.9');
    expect(trimPrice(199)).toBe('199');
  });

  it('abbreviates_large_counts', () => {
    expect(formatCount(326)).toBe('326');
    expect(formatCount(1204)).toBe('1.2k');
    expect(formatCount(23100)).toBe('2.3w');
  });

  it('formats_datetimes_in_local_time', () => {
    expect(formatDateTime('2026-10-03T09:30:00')).toMatch(/^\d{2}-\d{2} \d{2}:\d{2}$/u);
  });

  it('joins_class_names_ignoring_falsy_values', () => {
    expect(cx('a', false, undefined, 'b', null, '')).toBe('a b');
  });
});

describe('zhiya voucher QR (mock)', () => {
  it('renders_a_deterministic_module_grid_per_code', () => {
    expect(qrModuleCount('ZYAB2345')).toBe(qrModuleCount('ZYAB2345'));
    expect(qrModuleCount('ZYAB2345')).not.toBe(qrModuleCount('ZYCD6789'));
    // 441 modules total; a healthy grid fills roughly half.
    const count = qrModuleCount('ZYAB2345');
    expect(count).toBeGreaterThan(120);
    expect(count).toBeLessThan(400);
  });
});
