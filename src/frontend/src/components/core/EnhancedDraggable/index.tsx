// Enhanced draggable wrapper that adds visual feedback
import { ReactNode, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/utils";

interface EnhancedDraggableProps {
  children: ReactNode;
  onDragStart?: (event: React.DragEvent<any>) => void;
  onDragEnd?: (event: React.DragEvent<any>) => void;
  className?: string;
  draggable?: boolean;
}

export function EnhancedDraggable({
  children,
  onDragStart,
  onDragEnd,
  className,
  draggable = true,
}: EnhancedDraggableProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback(
    (event: React.DragEvent<any>) => {
      setIsDragging(true);
      onDragStart?.(event);
    },
    [onDragStart]
  );

  const handleDragEnd = useCallback(
    (event: React.DragEvent<any>) => {
      setIsDragging(false);
      onDragEnd?.(event);
    },
    [onDragEnd]
  );

  return (
    <motion.div
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "relative transition-all duration-200",
        isDragging && "cursor-grabbing opacity-50",
        !isDragging && "cursor-grab hover:scale-[1.02]",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
      
      {/* Drag indicator overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 rounded-lg border-2 border-dashed border-primary bg-primary/5"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
