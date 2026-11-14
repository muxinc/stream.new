/**
 * @jest-environment node
 */
import { getPlusUploadPercent, pickUploadVideoQuality } from './upload-quality';

describe('getPlusUploadPercent', () => {
  test('defaults to 0 when unset', () => {
    expect(process.env.PLUS_UPLOAD_PERCENT).toBeUndefined();
    expect(getPlusUploadPercent()).toBe(0);
    expect(pickUploadVideoQuality(undefined, () => 0)).toBe('basic');
  });

  test.each([
    ['0', 0],
    ['25', 25],
    ['100', 100],
    [' 10 ', 10],
  ])('accepts integer %p', (value, expected) => {
    expect(getPlusUploadPercent(value)).toBe(expected);
  });

  test.each(['', '  ', 'abc', 'off', '-5', '101', '12.5', '50%', '1e2', 'NaN'])('treats invalid value %p as 0', (value) => {
    expect(getPlusUploadPercent(value)).toBe(0);
  });

  test('reads PLUS_UPLOAD_PERCENT from the environment', () => {
    process.env.PLUS_UPLOAD_PERCENT = '25';
    try {
      expect(getPlusUploadPercent()).toBe(25);
      expect(pickUploadVideoQuality(undefined, () => 0.24)).toBe('plus');
      expect(pickUploadVideoQuality(undefined, () => 0.25)).toBe('basic');
    } finally {
      delete process.env.PLUS_UPLOAD_PERCENT;
    }
  });
});

describe('pickUploadVideoQuality', () => {
  test('0 percent is always basic', () => {
    expect(pickUploadVideoQuality(0, () => 0)).toBe('basic');
    expect(pickUploadVideoQuality(0, () => 0.999999)).toBe('basic');
  });

  test('100 percent is always plus', () => {
    expect(pickUploadVideoQuality(100, () => 0)).toBe('plus');
    expect(pickUploadVideoQuality(100, () => 0.999999)).toBe('plus');
  });

  test('splits at the percentage', () => {
    expect(pickUploadVideoQuality(25, () => 0.2499)).toBe('plus');
    expect(pickUploadVideoQuality(25, () => 0.25)).toBe('basic');
  });
});
