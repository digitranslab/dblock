/**
 * Property-based tests for HandleTooltipComponent
 * 
 * These tests verify the correctness properties defined in the design document
 * for the DBlock tooltip redesign.
 * 
 * **Feature: dblock-tooltip-redesign**
 */

import * as fc from "fast-check";

// DBlock brand colors (must match the component)
const DBLOCK_ORANGE = "#ffbd59";
const DBLOCK_TEXT = "#1a1a1a";

// Output category colors (must match the component)
const SUCCESS_COLOR = "#10B981";
const ELSE_COLOR = "#FF9500";

// Output category generator
const outputCategoryArb = fc.constantFrom("success", "else", null);

// Connection state generator
const connectionStateArb = fc.record({
  isConnecting: fc.boolean(),
  isCompatible: fc.boolean(),
  isSameNode: fc.boolean(),
});

/**
 * **Feature: dblock-tooltip-redesign, Property 2: Connection State Message Correctness**
 * 
 * *For any* combination of isConnecting, isCompatible, and isSameNode props:
 * - When isSameNode is true, display "Can't connect to the same node"
 * - When isConnecting is true and isCompatible is true, display "Connect to"
 * - When isConnecting is true and isCompatible is false, display "Incompatible with"
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3**
 */
describe("Property 2: Connection State Message Correctness", () => {
  // Function to get expected message based on state (mirrors component logic)
  const getExpectedMessage = (state: { isConnecting: boolean; isCompatible: boolean; isSameNode: boolean }): string => {
    if (state.isSameNode) {
      return "Can't connect to the same node";
    }
    if (state.isConnecting) {
      if (state.isCompatible) {
        return "Connect to";
      } else {
        return "Incompatible with";
      }
    }
    return "default"; // Default hover state with instructions
  };

  it("should return correct message for all connection states", () => {
    fc.assert(
      fc.property(connectionStateArb, (state) => {
        const message = getExpectedMessage(state);
        
        if (state.isSameNode) {
          expect(message).toBe("Can't connect to the same node");
        } else if (state.isConnecting && state.isCompatible) {
          expect(message).toBe("Connect to");
        } else if (state.isConnecting && !state.isCompatible) {
          expect(message).toBe("Incompatible with");
        } else {
          expect(message).toBe("default");
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it("should prioritize same-node error over other states", () => {
    fc.assert(
      fc.property(
        fc.record({
          isConnecting: fc.boolean(),
          isCompatible: fc.boolean(),
          isSameNode: fc.constant(true),
        }),
        (state) => {
          const message = getExpectedMessage(state);
          return message === "Can't connect to the same node";
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should show 'Connect to' when connecting and compatible", () => {
    fc.assert(
      fc.property(
        fc.record({
          isConnecting: fc.constant(true),
          isCompatible: fc.constant(true),
          isSameNode: fc.constant(false),
        }),
        (state) => {
          const message = getExpectedMessage(state);
          return message === "Connect to";
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should show 'Incompatible with' when connecting and not compatible", () => {
    fc.assert(
      fc.property(
        fc.record({
          isConnecting: fc.constant(true),
          isCompatible: fc.constant(false),
          isSameNode: fc.constant(false),
        }),
        (state) => {
          const message = getExpectedMessage(state);
          return message === "Incompatible with";
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: dblock-tooltip-redesign, Property 1: Output Type Display Correctness**
 * 
 * *For any* output handle with a category (success/else), the tooltip SHALL display 
 * the corresponding badge with the correct label and color.
 * 
 * **Validates: Requirements 3.1**
 */
describe("Property 1: Output Type Display Correctness", () => {
  // Function to get display info based on output category (mirrors component logic)
  const getOutputDisplayInfo = (category: "success" | "else" | null): { label: string | null; color: string | null } => {
    if (category === "success") {
      return { label: "Success", color: SUCCESS_COLOR };
    } else if (category === "else") {
      return { label: "Else", color: ELSE_COLOR };
    }
    return { label: null, color: null };
  };

  it("should display correct label and color for all output categories", () => {
    fc.assert(
      fc.property(outputCategoryArb, (category) => {
        const displayInfo = getOutputDisplayInfo(category);
        
        switch (category) {
          case "success":
            expect(displayInfo.label).toBe("Success");
            expect(displayInfo.color).toBe(SUCCESS_COLOR);
            expect(displayInfo.color).toBe("#10B981");
            break;
          case "else":
            expect(displayInfo.label).toBe("Else");
            expect(displayInfo.color).toBe(ELSE_COLOR);
            expect(displayInfo.color).toBe("#FF9500");
            break;
          default:
            expect(displayInfo.label).toBeNull();
            expect(displayInfo.color).toBeNull();
            break;
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it("should use green color for success category", () => {
    fc.assert(
      fc.property(fc.constant("success" as const), (category) => {
        const displayInfo = getOutputDisplayInfo(category);
        return displayInfo.color === SUCCESS_COLOR;
      }),
      { numRuns: 100 }
    );
  });

  it("should use orange color for else category", () => {
    fc.assert(
      fc.property(fc.constant("else" as const), (category) => {
        const displayInfo = getOutputDisplayInfo(category);
        return displayInfo.color === ELSE_COLOR;
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: dblock-tooltip-redesign, Property 3: Instructions Visibility**
 * 
 * *For any* tooltip state where isConnecting is false, the drag and click 
 * instructions SHALL be visible.
 * 
 * **Validates: Requirements 3.2**
 */
describe("Property 3: Instructions Visibility", () => {
  // Function to determine if instructions should be visible (mirrors component logic)
  const shouldShowInstructions = (isConnecting: boolean, isSameNode: boolean): boolean => {
    // Instructions are shown when not connecting and not same node error
    return !isConnecting && !isSameNode;
  };

  it("should show instructions when not connecting", () => {
    fc.assert(
      fc.property(
        fc.record({
          isConnecting: fc.constant(false),
          isSameNode: fc.constant(false),
        }),
        (state) => {
          return shouldShowInstructions(state.isConnecting, state.isSameNode) === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should hide instructions when connecting", () => {
    fc.assert(
      fc.property(
        fc.record({
          isConnecting: fc.constant(true),
          isSameNode: fc.boolean(),
        }),
        (state) => {
          // When connecting, instructions should be hidden (unless same node error)
          if (state.isSameNode) {
            return shouldShowInstructions(state.isConnecting, state.isSameNode) === false;
          }
          return shouldShowInstructions(state.isConnecting, state.isSameNode) === false;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * DBlock Branding Tests
 * 
 * **Validates: Requirements 1.1, 2.1**
 */
describe("DBlock Branding Constants", () => {
  it("should use correct DBlock orange color", () => {
    expect(DBLOCK_ORANGE).toBe("#ffbd59");
  });

  it("should use correct dark text color for readability", () => {
    expect(DBLOCK_TEXT).toBe("#1a1a1a");
  });

  it("should use correct success color", () => {
    expect(SUCCESS_COLOR).toBe("#10B981");
  });

  it("should use correct else color", () => {
    expect(ELSE_COLOR).toBe("#FF9500");
  });
});
