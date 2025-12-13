import useFlowStore from "@/stores/flowStore";
import { scapeJSONParse } from "@/utils/reactflowUtils";
import {
  BaseEdge,
  EdgeProps,
  getSmoothStepPath,
  Position,
} from "@xyflow/react";

// CSS for animated edge when node is selected
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
  sourceHandleId,
  source,
  sourceX,
  sourceY,
  target,
  targetHandleId,
  targetX,
  targetY,
  selected,
  ...props
}: EdgeProps) {
  const getNode = useFlowStore((state) => state.getNode);

  const sourceNode = getNode(source);
  const targetNode = getNode(target);

  const targetHandleObject = scapeJSONParse(targetHandleId!);

  // Check if either source or target node is selected
  const isSourceSelected = sourceNode?.selected ?? false;
  const isTargetSelected = targetNode?.selected ?? false;
  const isConnectedToSelectedNode = isSourceSelected || isTargetSelected;

  // Vertical layout: use the actual handle positions provided by React Flow
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    targetX,
    targetY,
  });

  // Determine stroke style based on selection state
  const strokeDasharray = targetHandleObject.output_types 
    ? "5 5" 
    : isConnectedToSelectedNode 
      ? "8 4" 
      : "0";

  // Animation style for selected nodes
  const animationStyle = isConnectedToSelectedNode
    ? {
        animation: "flowAnimation 0.5s linear infinite",
        strokeWidth: 2.5,
      }
    : {};

  return (
    <BaseEdge
      path={edgePath}
      strokeDasharray={strokeDasharray}
      style={{
        ...animationStyle,
        stroke: isConnectedToSelectedNode ? "hsl(var(--primary))" : undefined,
      }}
      {...props}
    />
  );
}
