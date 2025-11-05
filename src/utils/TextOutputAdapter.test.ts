// src/utils/TextOutputAdapter.test.ts
import { describe, it, expect } from 'vitest';
import { cleanDayLabel, cleanSplitType } from './TextOutputAdapter';

describe('cleanDayLabel', () => {
  const testCases = [
    { input: 'Mon-Upper-H', expected: 'Upper H' },
    { input: 'Tue-Lower-M', expected: 'Lower M' },
    { input: 'Wed-PushPull', expected: 'Pushpull' }, // Note: 'PushPull' becomes 'Pushpull' due to toLowerCase() after first char.
                                                    // If 'PushPull' is desired, map logic needs adjustment.
    { input: 'Thu_Intense_Day', expected: 'Intense Day' },
    { input: 'Fri-CardioOnly', expected: 'Cardioonly' }, // Similar to PushPull
    { input: 'Sat-Full Body Blast', expected: 'Full Body Blast' },
    { input: 'Sun-Rest', expected: 'Rest' },
    { input: 'Mon-', expected: '' }, // Edge case: only prefix
    { input: 'JustText', expected: 'Justtext' }, // No separators
    { input: '-StartsWithDash', expected: 'Startswithdash' }, // Starts with dash
    { input: 'Another-Test_Case Here', expected: 'Another Test Case Here' },
    { input: null, expected: '' },
    { input: undefined, expected: '' },
    { input: '', expected: '' },
  ];

  testCases.forEach(({ input, expected }) => {
    it(`should transform "${input}" to "${expected}"`, () => {
      expect(cleanDayLabel(input)).toBe(expected);
    });
  });

  // Specific test for 'PushPull' if mixed case is desired for single words after hyphen
  it('should handle single-word labels like "PushPull" correctly, maintaining case if desired', () => {
    // To get "PushPull" instead of "Pushpull", the map logic would be:
    // .map(word => word.charAt(0).toUpperCase() + word.substring(1)) 
    // For now, testing current behavior:
    expect(cleanDayLabel('Wed-PushPull')).toBe('Pushpull'); 
  });
});

describe('cleanSplitType', () => {
  const testCases = [
    { input: 'push_pull_legs', expected: 'Push Pull Legs' },
    { input: 'upper_lower', expected: 'Upper Lower' },
    { input: 'full_body', expected: 'Full Body' },
    { input: 'single', expected: 'Single' },
    { input: null, expected: '' },
    { input: undefined, expected: '' },
    { input: '', expected: '' },
  ];

  testCases.forEach(({ input, expected }) => {
    it(`should transform "${input}" to "${expected}"`, () => {
      expect(cleanSplitType(input)).toBe(expected);
    });
  });
});

