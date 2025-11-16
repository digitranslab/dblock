// Visual guides for snap-to-grid functionality
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface SnapToGridGuideProps {
  isActive: boolean;
  position: { x: number; y: number };
  gridSize?: number;
}

export function SnapToGridGuide({
  isActive,
  position,
  gridSize = 20,
}: SnapToGridGuideProps) {
  const [snappedPosition, setSnappedPosition] = useState(position);

  useEffect(() => {
    if (isActive) {
      const snappedX = Math.round(position.x / gridSize) * gridSize;
      const snappedY = Math.round(position.y / gridSize) * gridSize;
      setSnappedPosition({ x: snappedX, y: snappedY });
    }
  }, [position, gridSize, isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Vertical guide line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute h-full w-px bg-blue-500"
            style={{
              left: `${snappedPosition.x}px`,
              top: 0,
            }}
          />
          
          {/* Horizontal guide line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute h-px w-full bg-blue-500"
            style={{
              left: 0,
              top: `${snappedPosition.y}px`,
            }}
          />
          
          {/* Snap point indicator */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="pointer-events-none absolute h-3 w-3 rounded-full border-2 border-blue-500 bg-blue-500/30"
            style={{
              left: `${snappedPosition.x - 6}px`,
              top: `${snappedPosition.y - 6}px`,
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
