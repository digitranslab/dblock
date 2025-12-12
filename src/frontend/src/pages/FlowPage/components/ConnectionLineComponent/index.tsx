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

  // Calculate orthogonal path for vertical layout
  // Start from source (bottom), go down, then turn to reach target (top)
  const midY = fromY + (toY - fromY) / 2;
  const orthogonalPath = `M${fromX},${fromY} L${fromX},${midY} L${toX},${midY} L${toX},${toY}`;

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
