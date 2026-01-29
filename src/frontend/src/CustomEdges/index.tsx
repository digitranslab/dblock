import useFlowStore from "@/stores/flowStore";
import { scapeJSONParse } from "@/utils/reactflowUtils";
import {
  EdgeProps,
  getSmoothStepPath,
  Position,
} from "@xyflow/react";

// Handle colors matching the HandleRenderComponent
const HANDLE_COLORS = {
  input: "#9CA3AF",      // Gray
  success: "#10B981",    // Green
  else: "#FF9500",       // Orange
  default: "#71717a",    // Default gray
};

// CSS for animated edge during build
const ANIMATED_EDGE_STYLE = `
  @keyframes flowAnimation {
    0% {
      stroke-dashoffset: 24;
    }
    100% {
      stroke-dashoffset: 0;
    }
  }
`;

// Inject animation styles once
if (typeof document !== "undefined" && !document.getElementById("edge-animation-styles")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "edge-animation-styles";
  styleSheet.textContent = ANIMATED_EDGE_STYLE;
  document.head.appendChild(styleSheet);
}

export function DefaultEdge({
  id,
  sourceHandleId,
  source,
  sourceX,
  sourceY,
  target,
  targetHandleId,
  targetX,
  targetY,
  selected,
}: EdgeProps) {
  const getNode = useFlowStore((state) => state.getNode);

  const sourceNode = getNode(source);
  const targetNode = getNode(target);

  const sourceHandleObject = scapeJSONParse(sourceHandleId!);
  const targetHandleObject = scapeJSONParse(targetHandleId!);

  // Check if either source or target node is selected
  const isSourceSelected = sourceNode?.selected ?? false;
  const isTargetSelected = targetNode?.selected ?? false;
  const isConnectedToSelectedNode = isSourceSelected || isTargetSelected;

  // Vertical layout: use smoothstep path for curved connections
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    targetX,
    targetY,
    borderRadius: 8, // Smooth curves
  });

  // Determine edge color based on source handle type (success/else)
  const getEdgeColor = () => {
    const handleName = sourceHandleObject?.name;
    if (handleName === "success_output") {
      return HANDLE_COLORS.success;
    } else if (handleName === "else_output") {
      return HANDLE_COLORS.else;
    }
    return HANDLE_COLORS.default;
  };

  const baseColor = getEdgeColor();
  
  // Selected state: slightly brighter with glow
  const strokeColor = isConnectedToSelectedNode ? baseColor : baseColor;
  
  // Stroke width: 2px default, 3px when selected (per spec)
  const strokeWidth = selected || isConnectedToSelectedNode ? 3 : 2;

  // Determine stroke style based on state
  // - Loop edges (output_types present): dashed
  // - Animated during build: dashed animation
  // - Normal: solid
  const isLoopEdge = targetHandleObject?.output_types;
  const strokeDasharray = isLoopEdge 
    ? "5 5" 
    : isConnectedToSelectedNode 
      ? "8 4" 
      : "0";

  // Animation style for selected/building nodes
  const animationStyle = isConnectedToSelectedNode
    ? "flowAnimation 0.5s linear infinite"
    : "none";

  // Unique marker ID for this edge
  const markerId = `arrow-${id}`;

  // Glow filter for selected edges
  const glowFilter = selected ? `drop-shadow(0 0 3px ${baseColor})` : "none";

  return (
    <>
      <defs>
        <marker
          id={markerId}
          markerWidth="20"
          markerHeight="20"
          refX="16"
          refY="10"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M4,4 L16,10 L4,16 L7,10 Z"
            fill={strokeColor}
          />
        </marker>
      </defs>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        fill="none"
        markerEnd={`url(#${markerId})`}
        style={{
          animation: animationStyle,
          filter: glowFilter,
          transition: "stroke-width 150ms ease, filter 150ms ease",
        }}
      />
    </>
  );
}
