// Hook for managing drag feedback state
import { useState, useCallback } from "react";

export function useDragFeedback() {
  const [isDragging, setIsDragging] = useState(false);
  const [isValidDrop, setIsValidDrop] = useState(true);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  const startDrag = useCallback(() => {
    setIsDragging(true);
  }, []);

  const endDrag = useCallback(() => {
    setIsDragging(false);
    setIsValidDrop(true);
  }, []);

  const updateDragPosition = useCallback((x: number, y: number) => {
    setDragPosition({ x, y });
  }, []);

  const setDropValidity = useCallback((isValid: boolean) => {
    setIsValidDrop(isValid);
  }, []);

  return {
    isDragging,
    isValidDrop,
    dragPosition,
    startDrag,
    endDrag,
    updateDragPosition,
    setDropValidity,
  };
}
