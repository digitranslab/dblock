// Visual feedback for valid drop zones
import { motion } from "framer-motion";
import { cn } from "@/utils/utils";

interface DropZoneIndicatorProps {
  isActive: boolean;
  isValid: boolean;
}

export function DropZoneIndicator({ isActive, isValid }: DropZoneIndicatorProps) {
  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "pointer-events-none absolute inset-0 z-50 rounded-lg border-4 border-dashed",
        isValid
          ? "border-green-500 bg-green-500/10"
          : "border-red-500 bg-red-500/10"
      )}
    >
      <div className="flex h-full items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={cn(
            "rounded-full px-6 py-3 text-sm font-medium shadow-lg",
            isValid
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          )}
        >
          {isValid ? "Drop here to add node" : "Invalid drop location"}
        </motion.div>
      </div>
    </motion.div>
  );
}
