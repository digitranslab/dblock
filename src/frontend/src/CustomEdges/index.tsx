import useFlowStore from "@/stores/flowStore";
import { scapeJSONParse } from "@/utils/reactflowUtils";
import {
  BaseEdge,
  EdgeProps,
  getSmoothStepPath,
  Position,
} from "@xyflow/react";

export function DefaultEdge({
  sourceHandleId,
  source,
  sourceX,
  sourceY,
  target,
  targetHandleId,
  targetX,
  targetY,
  ...props
}: EdgeProps) {
  const getNode = useFlowStore((state) => state.getNode);

  const sourceNode = getNode(source);
  const targetNode = getNode(target);

  const targetHandleObject = scapeJSONParse(targetHandleId!);

  // Vertical layout: source at bottom, target at top
  const sourceYNew =
    (sourceNode?.position.y ?? 0) + (sourceNode?.measured?.height ?? 0);
  const targetYNew = targetNode?.position.y ?? 0;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY: sourceYNew,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    targetX,
    targetY: targetYNew,
  });

  return (
    <BaseEdge
      path={edgePath}
      strokeDasharray={targetHandleObject.output_types ? "5 5" : "0"}
      {...props}
    />
  );
}
