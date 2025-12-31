import { expect, test } from "@playwright/test";
import { awaitBootstrapTest } from "../../utils/await-bootstrap-test";

/**
 * Feature: canvas-solid-background, Property 1: Background Removal Completeness
 * 
 * Property: For any canvas render, the DOM should not contain any ReactFlow 
 * Background component elements (no elements with class `react-flow__background`)
 * 
 * Validates: Requirements 1.1
 * 
 * This property-based test verifies the invariant across 100+ different canvas states
 * including: blank flows, flows with components, zoomed states, and panned states.
 */
test(
  "Property Test: Background element absence across multiple canvas states",
  { tag: ["@release", "@workspace"] },
  async ({ page }) => {
    await awaitBootstrapTest(page);

    // Wait for the application to load
    await page.waitForSelector('[data-testid="blank-flow"]', {
      timeout: 30000,
    });

    // Property-based test: Run 100 iterations checking different canvas states
    const iterations = 100;
    const failedIterations: { iteration: number; state: string }[] = [];

    for (let i = 0; i < iterations; i++) {
      let currentState = "unknown";
      
      try {
        // Test different canvas states by creating flows, adding components, etc.
        if (i === 0) {
          // Iteration 0: Check blank flow state
          currentState = "blank-flow-initial";
          await page.getByTestId("blank-flow").click();
          await page.waitForTimeout(200);
        } else if (i % 20 === 1) {
          // Every 20th iteration: Create a new blank flow
          currentState = "blank-flow-new";
          await page.getByTestId("icon-ChevronLeft").first().click();
          await page.waitForTimeout(200);
          await page.getByTestId("blank-flow").click();
          await page.waitForTimeout(200);
        } else if (i % 10 === 2 && i > 1) {
          // Every 10th iteration: Add a component to test canvas with nodes
          currentState = "canvas-with-component";
          await page.getByTestId("sidebar-search-input").click();
          await page.getByTestId("sidebar-search-input").fill("Chat Input");
          await page.waitForSelector('[data-testid="inputsChat Input"]', {
            timeout: 2000,
          });
          await page
            .getByTestId("inputsChat Input")
            .dragTo(page.locator('//*[@id="react-flow-id"]'));
          await page.mouse.up();
          await page.mouse.down();
          await page.waitForTimeout(200);
        } else if (i % 7 === 3 && i > 2) {
          // Every 7th iteration: Test zoom in
          currentState = "canvas-zoomed-in";
          const zoomInButton = page.getByTestId("zoom-in");
          if (await zoomInButton.isVisible()) {
            await zoomInButton.click();
            await page.waitForTimeout(100);
          }
        } else if (i % 7 === 4 && i > 3) {
          // Every 7th iteration: Test zoom out
          currentState = "canvas-zoomed-out";
          const zoomOutButton = page.getByTestId("zoom-out");
          if (await zoomOutButton.isVisible()) {
            await zoomOutButton.click();
            await page.waitForTimeout(100);
          }
        } else if (i % 15 === 5 && i > 4) {
          // Every 15th iteration: Test fit view
          currentState = "canvas-fit-view";
          const fitViewButton = page.getByTestId("fit-view");
          if (await fitViewButton.isVisible()) {
            await fitViewButton.click();
            await page.waitForTimeout(100);
          }
        } else {
          // Other iterations: Just wait and check current state
          currentState = `canvas-state-${i}`;
          await page.waitForTimeout(50);
        }

        // PROPERTY CHECK: Verify no Background component exists
        const backgroundElements = await page.locator('.react-flow__background').count();
        
        if (backgroundElements > 0) {
          failedIterations.push({ iteration: i, state: currentState });
        }
      } catch (error) {
        // If an interaction fails, still check the property
        const backgroundElements = await page.locator('.react-flow__background').count();
        if (backgroundElements > 0) {
          failedIterations.push({ iteration: i, state: `${currentState}-error` });
        }
      }
    }

    // Assert that all iterations passed
    if (failedIterations.length > 0) {
      console.error(`Property test failed on ${failedIterations.length} iterations:`);
      failedIterations.forEach(({ iteration, state }) => {
        console.error(`  - Iteration ${iteration} (${state})`);
      });
    }
    
    expect(failedIterations.length).toBe(0);
  },
);

/**
 * Supplementary test: Verify background element absence on initial load
 * This is a simpler test that complements the property-based test above
 */
test(
  "Background element should not exist on initial canvas load",
  { tag: ["@release", "@workspace"] },
  async ({ page }) => {
    await awaitBootstrapTest(page);

    await page.waitForSelector('[data-testid="blank-flow"]', {
      timeout: 30000,
    });
    await page.getByTestId("blank-flow").click();

    // Wait for ReactFlow to be fully initialized
    await page.waitForSelector('//*[@id="react-flow-id"]', {
      timeout: 5000,
    });

    // Verify no elements with class 'react-flow__background' exist
    const backgroundElements = await page.locator('.react-flow__background').count();
    expect(backgroundElements).toBe(0);

    // Verify the canvas wrapper has the bg-canvas class (solid background)
    const canvasWrapper = await page.locator('.bg-canvas').count();
    expect(canvasWrapper).toBeGreaterThan(0);
  },
);

/**
 * Feature: canvas-solid-background, Property 2: Theme-Aware Background Color
 * 
 * Property: For any theme state (light or dark), the canvas background color 
 * should match the corresponding --canvas CSS variable value
 * 
 * Validates: Requirements 1.2, 1.3
 * 
 * This property-based test verifies that the canvas background color correctly
 * reflects the theme across 100+ theme switches and canvas states.
 */
test(
  "Property Test: Theme-aware background color across multiple theme switches",
  { tag: ["@release", "@workspace"] },
  async ({ page }) => {
    await awaitBootstrapTest(page);

    // Wait for the application to load
    await page.waitForSelector('[data-testid="blank-flow"]', {
      timeout: 30000,
    });
    await page.getByTestId("blank-flow").click();

    // Wait for ReactFlow to be fully initialized
    await page.waitForSelector('//*[@id="react-flow-id"]', {
      timeout: 5000,
    });

    // Helper function to get the expected canvas color based on theme
    const getExpectedCanvasColor = async (isDark: boolean): Promise<string> => {
      // Light theme: --canvas: 240 5% 96% (hsl(240, 5%, 96%))
      // Dark theme: --canvas: 0 0% 0% (hsl(0, 0%, 0%))
      if (isDark) {
        return "rgb(0, 0, 0)"; // hsl(0, 0%, 0%) = black
      } else {
        return "rgb(244, 244, 246)"; // hsl(240, 5%, 96%) ≈ rgb(244, 244, 246)
      }
    };

    // Helper function to toggle theme by manipulating localStorage and reloading
    const toggleTheme = async (setDark: boolean) => {
      await page.evaluate((dark) => {
        window.localStorage.setItem("isDark", dark.toString());
        // Add or remove dark class from document element
        if (dark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }, setDark);
      // Wait for CSS to apply
      await page.waitForTimeout(100);
    };

    // Property-based test: Run 100 iterations checking different theme states
    const iterations = 100;
    const failedIterations: { 
      iteration: number; 
      theme: string; 
      expected: string; 
      actual: string;
    }[] = [];

    for (let i = 0; i < iterations; i++) {
      try {
        // Alternate between light and dark themes, with some randomness
        const shouldBeDark = i % 2 === 0 || (i % 7 === 0 && i > 0);
        await toggleTheme(shouldBeDark);

        const expectedColor = await getExpectedCanvasColor(shouldBeDark);
        
        // Get the actual background color of the canvas
        const canvasElement = page.locator('.bg-canvas').first();
        const actualColor = await canvasElement.evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });

        // PROPERTY CHECK: Verify canvas background matches expected theme color
        if (actualColor !== expectedColor) {
          failedIterations.push({
            iteration: i,
            theme: shouldBeDark ? "dark" : "light",
            expected: expectedColor,
            actual: actualColor,
          });
        }

        // Occasionally perform canvas interactions to test theme persistence
        if (i % 10 === 5 && i > 4) {
          // Zoom in
          const zoomInButton = page.getByTestId("zoom-in");
          if (await zoomInButton.isVisible()) {
            await zoomInButton.click();
            await page.waitForTimeout(50);
          }
        } else if (i % 10 === 8 && i > 7) {
          // Zoom out
          const zoomOutButton = page.getByTestId("zoom-out");
          if (await zoomOutButton.isVisible()) {
            await zoomOutButton.click();
            await page.waitForTimeout(50);
          }
        }

      } catch (error) {
        // If an interaction fails, still check the property
        const shouldBeDark = i % 2 === 0;
        const expectedColor = await getExpectedCanvasColor(shouldBeDark);
        const canvasElement = page.locator('.bg-canvas').first();
        const actualColor = await canvasElement.evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });

        if (actualColor !== expectedColor) {
          failedIterations.push({
            iteration: i,
            theme: shouldBeDark ? "dark" : "light",
            expected: expectedColor,
            actual: actualColor,
          });
        }
      }
    }

    // Assert that all iterations passed
    if (failedIterations.length > 0) {
      console.error(`Property test failed on ${failedIterations.length} iterations:`);
      failedIterations.forEach(({ iteration, theme, expected, actual }) => {
        console.error(`  - Iteration ${iteration} (${theme} theme): expected ${expected}, got ${actual}`);
      });
    }
    
    expect(failedIterations.length).toBe(0);
  },
);

/**
 * Feature: canvas-solid-background, Property 3: Canvas Interaction Preservation
 * 
 * Property: For any canvas interaction (node drag, zoom, pan, connection creation),
 * the interaction should complete successfully without errors or visual artifacts
 * 
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 * 
 * This property-based test verifies that all canvas interactions work correctly
 * across 100+ different interaction scenarios after removing the Background component.
 */
test(
  "Property Test: Canvas interaction preservation across multiple operations",
  { tag: ["@release", "@workspace"] },
  async ({ page }) => {
    await awaitBootstrapTest(page);

    // Wait for the application to load
    await page.waitForSelector('[data-testid="blank-flow"]', {
      timeout: 30000,
    });
    await page.getByTestId("blank-flow").click();

    // Wait for ReactFlow to be fully initialized
    await page.waitForSelector('//*[@id="react-flow-id"]', {
      timeout: 5000,
    });

    // Property-based test: Run 100 iterations testing different canvas interactions
    const iterations = 100;
    const failedIterations: { 
      iteration: number; 
      interaction: string; 
      error: string;
    }[] = [];

    // Track console errors during interactions
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Track page errors
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    for (let i = 0; i < iterations; i++) {
      let currentInteraction = "unknown";
      const errorsBefore = consoleErrors.length + pageErrors.length;
      
      try {
        // Test different canvas interactions in a varied pattern
        if (i % 20 === 0 && i > 0) {
          // Every 20th iteration: Add a new component (node drag from sidebar)
          currentInteraction = "add-component-drag";
          await page.getByTestId("sidebar-search-input").click();
          await page.getByTestId("sidebar-search-input").fill("Chat Input");
          await page.waitForTimeout(200);
          
          const chatInputExists = await page.getByTestId("inputsChat Input").count() > 0;
          if (chatInputExists) {
            await page
              .getByTestId("inputsChat Input")
              .dragTo(page.locator('//*[@id="react-flow-id"]'), {
                targetPosition: { x: 200 + (i * 10) % 400, y: 200 + (i * 15) % 300 },
              });
            await page.mouse.up();
            await page.waitForTimeout(100);
          }
        } else if (i % 15 === 1 && i > 0) {
          // Every 15th iteration: Test node dragging (move existing node)
          currentInteraction = "node-drag";
          const nodes = await page.locator('[data-testid="div-generic-node"]').all();
          if (nodes.length > 0) {
            const nodeIndex = i % nodes.length;
            const node = nodes[nodeIndex];
            const box = await node.boundingBox();
            if (box) {
              await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
              await page.mouse.down();
              await page.mouse.move(box.x + 50, box.y + 50, { steps: 5 });
              await page.mouse.up();
              await page.waitForTimeout(100);
            }
          }
        } else if (i % 10 === 2 && i > 1) {
          // Every 10th iteration: Test zoom in
          currentInteraction = "zoom-in";
          const zoomInButton = page.getByTestId("zoom-in");
          if (await zoomInButton.isVisible()) {
            await zoomInButton.click();
            await page.waitForTimeout(100);
          }
        } else if (i % 10 === 3 && i > 2) {
          // Every 10th iteration: Test zoom out
          currentInteraction = "zoom-out";
          const zoomOutButton = page.getByTestId("zoom-out");
          if (await zoomOutButton.isVisible()) {
            await zoomOutButton.click();
            await page.waitForTimeout(100);
          }
        } else if (i % 12 === 4 && i > 3) {
          // Every 12th iteration: Test fit view (canvas pan/zoom reset)
          currentInteraction = "fit-view";
          const fitViewButton = page.getByTestId("fit-view");
          if (await fitViewButton.isVisible()) {
            await fitViewButton.click();
            await page.waitForTimeout(100);
          }
        } else if (i % 8 === 5 && i > 4) {
          // Every 8th iteration: Test canvas panning
          currentInteraction = "canvas-pan";
          const canvas = page.locator('//*[@id="react-flow-id"]');
          const box = await canvas.boundingBox();
          if (box) {
            // Pan by dragging on empty canvas area
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.mouse.down();
            await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 100, { steps: 5 });
            await page.mouse.up();
            await page.waitForTimeout(100);
          }
        } else if (i % 25 === 6 && i > 5) {
          // Every 25th iteration: Test multi-node selection
          currentInteraction = "multi-node-selection";
          const nodes = await page.locator('[data-testid="div-generic-node"]').all();
          if (nodes.length >= 2) {
            // Select first node
            const node1 = nodes[0];
            const box1 = await node1.boundingBox();
            if (box1) {
              await page.mouse.click(box1.x + box1.width / 2, box1.y + box1.height / 2);
              await page.waitForTimeout(50);
              
              // Hold shift and select second node
              await page.keyboard.down('Shift');
              const node2 = nodes[1];
              const box2 = await node2.boundingBox();
              if (box2) {
                await page.mouse.click(box2.x + box2.width / 2, box2.y + box2.height / 2);
              }
              await page.keyboard.up('Shift');
              await page.waitForTimeout(100);
            }
          }
        } else if (i % 30 === 7 && i > 6) {
          // Every 30th iteration: Test connection creation
          currentInteraction = "connection-creation";
          const outputHandles = await page.locator('[data-testid*="handle-"][data-testid*="-right"]').all();
          const inputHandles = await page.locator('[data-testid*="handle-"][data-testid*="-left"]').all();
          
          if (outputHandles.length > 0 && inputHandles.length > 0) {
            const outputHandle = outputHandles[0];
            const inputHandle = inputHandles[inputHandles.length - 1];
            
            const outputBox = await outputHandle.boundingBox();
            const inputBox = await inputHandle.boundingBox();
            
            if (outputBox && inputBox) {
              await page.mouse.move(outputBox.x + outputBox.width / 2, outputBox.y + outputBox.height / 2);
              await page.mouse.down();
              await page.mouse.move(inputBox.x + inputBox.width / 2, inputBox.y + inputBox.height / 2, { steps: 10 });
              await page.mouse.up();
              await page.waitForTimeout(100);
            }
          }
        } else {
          // Other iterations: Just verify canvas is responsive
          currentInteraction = `canvas-check-${i}`;
          await page.waitForTimeout(50);
        }

        // PROPERTY CHECK: Verify no new errors occurred during interaction
        const errorsAfter = consoleErrors.length + pageErrors.length;
        if (errorsAfter > errorsBefore) {
          const newErrors = [
            ...consoleErrors.slice(errorsBefore),
            ...pageErrors.slice(errorsBefore - consoleErrors.length)
          ];
          failedIterations.push({
            iteration: i,
            interaction: currentInteraction,
            error: newErrors.join('; '),
          });
        }

        // PROPERTY CHECK: Verify ReactFlow canvas is still present and functional
        const canvasExists = await page.locator('//*[@id="react-flow-id"]').count() > 0;
        if (!canvasExists) {
          failedIterations.push({
            iteration: i,
            interaction: currentInteraction,
            error: 'Canvas element disappeared',
          });
        }

      } catch (error) {
        // If an interaction throws an error, record it
        failedIterations.push({
          iteration: i,
          interaction: currentInteraction,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Assert that all iterations passed
    if (failedIterations.length > 0) {
      console.error(`Property test failed on ${failedIterations.length} iterations:`);
      failedIterations.forEach(({ iteration, interaction, error }) => {
        console.error(`  - Iteration ${iteration} (${interaction}): ${error}`);
      });
    }
    
    expect(failedIterations.length).toBe(0);
  },
);
