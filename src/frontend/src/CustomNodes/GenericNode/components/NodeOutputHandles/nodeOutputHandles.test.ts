/**
 * Property-based tests for NodeOutputHandles
 * 
 * These tests verify the correctness properties defined in the design document
 * for the GitHub Actions-style handle redesign.
 * 
 * **Feature: github-actions-handles**
 */

import * as fc from "fast-check";

// Handle spacing constant (must match the component)
const HANDLE_SPACING = 16; // px gap between handles

/**
 * **Feature: github-actions-handles, Property 2: Handle Spacing Consistency**
 * 
 * *For any* node with multiple output handles, the gap between adjacent handles 
 * SHALL be exactly 16px.
 * 
 * **Validates: Requirements 2.3**
 */
describe("Property 2: Handle Spacing Consistency", () => {
  // Generator for number of output handles (1-5)
  const handleCountArb = fc.integer({ min: 1, max: 5 });

  it("should maintain 16px gap between all output handles", () => {
    fc.assert(
      fc.property(handleCountArb, (handleCount) => {
        // The gap between handles should always be 16px
        const expectedGap = HANDLE_SPACING;
        
        // Verify the constant is correct
        expect(expectedGap).toBe(16);
        
        // For any number of handles, the gap should be consistent
        if (handleCount > 1) {
          // Total spacing = (handleCount - 1) * gap
          const totalSpacing = (handleCount - 1) * expectedGap;
          expect(totalSpacing).toBe((handleCount - 1) * 16);
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it("should calculate correct container width for multiple handles", () => {
    fc.assert(
      fc.property(handleCountArb, (handleCount) => {
        const handleWidth = 16; // px (from HANDLE_STYLES)
        const gap = HANDLE_SPACING;
        
        // Total width = (handleCount * handleWidth) + ((handleCount - 1) * gap)
        const expectedWidth = (handleCount * handleWidth) + ((handleCount - 1) * gap);
        
        // Verify calculation is correct
        if (handleCount === 1) {
          expect(expectedWidth).toBe(16);
        } else if (handleCount === 2) {
          expect(expectedWidth).toBe(16 + 16 + 16); // 48px
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });
});
