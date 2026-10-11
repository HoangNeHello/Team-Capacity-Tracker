// load.test.js: unit tests for getLoad
import { describe, test, expect } from 'vitest';
import { getLoad } from './load.js';

// Each test: getLoad(weeklyHours, assignedHours) → expected { percent, level }.
// Edges (exactly 80, exactly 100) checked on purpose: off-by-one bugs (> vs >=) hide there.
describe('getLoad', () => {
  // 0 weekly hours: no divide by 0, percent null
  test('0 weekly, 0 assigned', () => {
    expect(getLoad(0, 0)).toEqual({ percent: null, level: 'none' });
  });

  test('0 weekly, 2 assigned', () => {
    expect(getLoad(0, 2)).toEqual({ percent: null, level: 'over' });
  });

  test('40 weekly, 20 assigned', () => {
    expect(getLoad(40, 20)).toEqual({ percent: 50, level: 'under' });
  });

  test('20 weekly, 18 assigned', () => {
    expect(getLoad(20, 18)).toEqual({ percent: 90, level: 'near' });
  });

  test('20 weekly, 16 assigned (exactly 80)', () => {
    expect(getLoad(20, 16)).toEqual({ percent: 80, level: 'near' });
  });

  test('20 weekly, 20 assigned (exactly 100)', () => {
    expect(getLoad(20, 20)).toEqual({ percent: 100, level: 'near' });
  });

  test('10 weekly, 14 assigned', () => {
    expect(getLoad(10, 14)).toEqual({ percent: 140, level: 'over' });
  });

  // 1/3 = 33.33… rounds down, 2/3 = 66.66… rounds up
  test('rounding', () => {
    expect(getLoad(3, 1)).toEqual({ percent: 33, level: 'under' });
    expect(getLoad(3, 2)).toEqual({ percent: 67, level: 'under' });
  });
});
