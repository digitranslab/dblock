// Enhanced connection line with animated preview
import { ConnectionLineComponentProps } from "@xyflow/react";
import { motion } from "framer-motion";

export function EnhancedConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  connectionLineStyle,
}: ConnectionLineComponentProps) {
  // Calculate the path for a smooth bezier curve
  const centerX = (fromX + toX) / 2;
  const centerY = (fromY + toY) / 2;
  
  const path = `M ${fromX} ${fromY} Q ${centerX} ${fromY}, ${centerX} ${centerY} T ${toX} ${toY}`;

  return (
    <g>
      {/* Background glow */}
      <motion.path
        d={path}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={6}
        strokeOpacity={0.2}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Main line */}
      <motion.path
        d={path}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        strokeDasharray="5,5"
        initial={{ pathLength: 0, strokeDashoffset: 10 }}
        animate={{ 
          pathLength: 1,
          strokeDashoffset: 0
        }}
        transition={{ 
          pathLength: { duration: 0.3 },
          strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" }
        }}
        style={connectionLineStyle}
      />
      
      {/* Animated dot at the end */}
      <motion.circle
        cx={toX}
        cy={toY}
        r={4}
        fill="hsl(var(--primary))"
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ 
          duration: 0.6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </g>
  );
}
