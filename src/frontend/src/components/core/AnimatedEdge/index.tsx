// Animated edge with particle flow effect
import {
  BaseEdge,
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
} from "@xyflow/react";
import { motion } from "framer-motion";
import { useState } from "react";

interface AnimatedEdgeProps extends EdgeProps {
  animated?: boolean;
  showParticles?: boolean;
  particleColor?: string;
}

export function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  animated = false,
  showParticles = false,
  particleColor = "hsl(var(--primary))",
}: AnimatedEdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Glow effect on hover */}
      {isHovered && (
        <path
          d={edgePath}
          fill="none"
          stroke={particleColor}
          strokeWidth={8}
          strokeOpacity={0.2}
          className="pointer-events-none"
        />
      )}

      {/* Main edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: isHovered ? 3 : 2,
          transition: "stroke-width 0.2s ease",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Animated particles */}
      {(animated || showParticles) && (
        <g>
          {[0, 0.33, 0.66].map((offset, index) => (
            <motion.circle
              key={`particle-${id}-${index}`}
              r={3}
              fill={particleColor}
              initial={{ offsetDistance: `${offset * 100}%` }}
              animate={{ offsetDistance: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                delay: offset * 2,
              }}
              style={{
                offsetPath: `path('${edgePath}')`,
              }}
            >
              <animateMotion
                dur="2s"
                repeatCount="indefinite"
                begin={`${offset * 2}s`}
              >
                <mpath href={`#${id}`} />
              </animateMotion>
            </motion.circle>
          ))}
        </g>
      )}

      {/* Hidden path for animation */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke="none"
        className="pointer-events-none"
      />
    </>
  );
}
