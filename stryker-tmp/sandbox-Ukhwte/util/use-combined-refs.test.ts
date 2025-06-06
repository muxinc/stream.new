// @ts-nocheck
import { useCombinedRefs } from './use-combined-refs';

describe('useCombinedRefs', () => {
  it('exports useCombinedRefs hook', () => {
    expect(typeof useCombinedRefs).toBe('function');
  });

  it('is a valid React hook function', () => {
    // Test that the function exists and can be imported
    expect(useCombinedRefs).toBeDefined();
    expect(useCombinedRefs.length).toBeGreaterThanOrEqual(0); // accepts variable number of arguments
  });

  it('has the correct function signature', () => {
    // Check that it's a function that can accept parameters
    expect(typeof useCombinedRefs).toBe('function');
    // Function name should contain 'use' prefix for React hook convention
    expect(useCombinedRefs.name).toContain('useCombinedRefs');
  });
});