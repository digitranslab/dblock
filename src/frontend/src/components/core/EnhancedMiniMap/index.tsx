// Enhanced MiniMap with node status colors and execution flow
import { MiniMap, Node, XYPosition } from "@xyflow/react";
import { BuildStatus } from "@/constants/enums";
import { motion } from "framer-motion";
import { useCallback } from "react";

interface EnhancedMiniMapProps {
  buildStatus?: Record<string, { status: BuildStatus; timestamp?: string }>;
  onClick?: (position: XYPosition) => void;
  className?: string;
}

export function EnhancedMiniMap({
  buildStatus = {},
  onClick,
  className,
}: EnhancedMiniMapProps) {
  // Color nodes based on their build status
  const nodeColor = useCallback(
    (node: Node) => {
      const status = buildStatus[node.id]?.status;

      switch (status) {
        case BuildStatus.BUILDING:
          return "#3b82f6"; // blue - building
        case BuildStatus.BUILT:
          return "#10b981"; // green - success
        case BuildStatus.ERROR:
          return "#ef4444"; // red - error
        case BuildStatus.INACTIVE:
          return "#9ca3af"; // gray - inactive
        default:
          return "#6b7280"; // default gray
      }
    },
    [buildStatus]
  );

  // Style for nodes based on status
  const nodeClassName = useCallback(
    (node: Node) => {
      const status = buildStatus[node.id]?.status;
      return status === BuildStatus.BUILDING ? "animate-pulse" : "";
    },
    [buildStatus]
  );

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, position: XYPosition) => {
      event.stopPropagation();
      onClick?.(position);
    },
    [onClick]
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <MiniMap
        nodeColor={nodeColor}
        nodeClassName={nodeClassName}
        nodeStrokeWidth={3}
        pannable
        zoomable
        onClick={handleNodeClick}
        className="rounded-lg border border-border bg-background shadow-lg"
        style={{
          backgroundColor: "hsl(var(--background))",
        }}
      />
    </motion.div>
  );
}
