import useFlowStore from "@/stores/flowStore";
import { ConnectionLineComponentProps } from "@xyflow/react";

const ConnectionLineComponent = ({
  fromX,
  fromY,
  toX,
  toY,
  connectionLineStyle = {},
}: ConnectionLineComponentProps): JSX.Element => {
  const handleDragging = useFlowStore((state) => state.handleDragging);
  const color = handleDragging?.color;
  const accentColor = `hsl(var(--datatype-${color}))`;

  // Calculate orthogonal path
  // Start from source, go right, then turn to reach target
  const midX = fromX + (toX - fromX) / 2;
  const orthogonalPath = `M${fromX},${fromY} L${midX},${fromY} L${midX},${toY} L${toX},${toY}`;

  return (
    <g>
      <path
        fill="none"
        strokeWidth={2}
        className={`animated`}
        style={{
          stroke: handleDragging ? accentColor : "",
          ...connectionLineStyle,
        }}
        d={orthogonalPath}
      />
      <circle
        cx={toX}
        cy={toY}
        fill="#fff"
        r={5}
        stroke={accentColor}
        className=""
        strokeWidth={1.5}
      />
    </g>
  );
};

export default ConnectionLineComponent;
