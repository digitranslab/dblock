// Enhanced drag utilities with visual feedback
import { APIClassType } from "@/types/api";
import { createRoot } from "react-dom/client";
import { DragPreview } from "@/components/core/DragPreview";

/**
 * Creates an enhanced drag image with better visual feedback
 * This is a non-breaking enhancement to the existing drag system
 */
export function createEnhancedDragImage(
  event: React.DragEvent<any>,
  data: { type: string; node?: APIClassType }
): HTMLElement {
  // Create ghost element for drag preview
  const ghost = document.createElement("div");
  ghost.style.position = "absolute";
  ghost.style.top = "-10000px";
  ghost.style.left = "-10000px";
  ghost.style.pointerEvents = "none";
  ghost.style.zIndex = "9999";
  
  document.body.appendChild(ghost);

  // Render the enhanced preview
  if (data.node) {
    const root = createRoot(ghost);
    root.render(<DragPreview node={data.node} type={data.type} />);
  }

  // Set the drag image
  event.dataTransfer.setDragImage(ghost, 0, 0);

  // Clean up after a short delay
  setTimeout(() => {
    try {
      if (ghost.parentNode) {
        document.body.removeChild(ghost);
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  }, 0);

  return ghost;
}

/**
 * Adds glow effect to valid drop targets
 */
export function addDropTargetGlow(element: HTMLElement | null) {
  if (!element) return;
  
  element.style.transition = "box-shadow 0.3s ease, transform 0.3s ease";
  element.style.boxShadow = "0 0 20px 4px rgba(59, 130, 246, 0.5)";
  element.style.transform = "scale(1.02)";
}

/**
 * Removes glow effect from drop targets
 */
export function removeDropTargetGlow(element: HTMLElement | null) {
  if (!element) return;
  
  element.style.boxShadow = "";
  element.style.transform = "";
}

/**
 * Adds shake animation for invalid drops
 */
export function addInvalidDropAnimation(element: HTMLElement | null) {
  if (!element) return;
  
  element.style.animation = "shake 0.5s ease-in-out";
  
  setTimeout(() => {
    element.style.animation = "";
  }, 500);
}

// Add shake keyframes to document if not already present
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
      20%, 40%, 60%, 80% { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(styleSheet);
}
