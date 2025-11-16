// Magnetic connection points with visual feedback
import { Handle, HandleProps } from "@xyflow/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/utils/utils";

interface MagneticHandleProps extends HandleProps {
  magneticRadius?: number;
}

export function MagneticHandle({
  magneticRadius = 30,
  className,
  ...props
}: MagneticHandleProps) {
  const [isNearby, setIsNearby] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  return (
    <div className="relative">
      {/* Magnetic field indicator */}
      {isNearby && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          exit={{ scale: 0, opacity: 0 }}
          className="pointer-events-none absolute inset-0 -m-4 rounded-full bg-primary"
          style={{
            width: `${magneticRadius * 2}px`,
            height: `${magneticRadius * 2}px`,
            left: `50%`,
            top: `50%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      {/* Pulse animation when connecting */}
      {isConnecting && (
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute inset-0 -m-2 rounded-full border-2 border-primary"
        />
      )}

      {/* The actual handle */}
      <Handle
        {...props}
        className={cn(
          "transition-all duration-200",
          isNearby && "scale-125 ring-2 ring-primary ring-offset-2",
          isConnecting && "animate-pulse",
          className
        )}
        onMouseEnter={() => setIsNearby(true)}
        onMouseLeave={() => setIsNearby(false)}
      />
    </div>
  );
}
