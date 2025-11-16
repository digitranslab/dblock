// Hook for snap-to-grid functionality
import { useCallback, useState } from "react";
import { XYPosition } from "@xyflow/react";

interface UseSnapToGridOptions {
  gridSize?: number;
  enabled?: boolean;
}

export function useSnapToGrid({
  gridSize = 20,
  enabled = true,
}: UseSnapToGridOptions = {}) {
  const [isSnapping, setIsSnapping] = useState(false);

  const snapToGrid = useCallback(
    (position: XYPosition): XYPosition => {
      if (!enabled) return position;

      return {
        x: Math.round(position.x / gridSize) * gridSize,
        y: Math.round(position.y / gridSize) * gridSize,
      };
    },
    [gridSize, enabled]
  );

  const getSnappedPosition = useCallback(
    (x: number, y: number): XYPosition => {
      return snapToGrid({ x, y });
    },
    [snapToGrid]
  );

  const enableSnapping = useCallback(() => {
    setIsSnapping(true);
  }, []);

  const disableSnapping = useCallback(() => {
    setIsSnapping(false);
  }, []);

  return {
    snapToGrid,
    getSnappedPosition,
    isSnapping,
    enableSnapping,
    disableSnapping,
    gridSize,
  };
}
