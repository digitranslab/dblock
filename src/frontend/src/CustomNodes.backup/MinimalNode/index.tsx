import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { NodeIcon } from "../GenericNode/components/nodeIcon";
import { BuildStatus } from "../../constants/enums";
import { NodeDataType } from "../../types/flow";
import { cn } from "../../utils/utils";
import useFlowStore from "../../stores/flowStore";

interface MinimalNodeProps {
  data: NodeDataType;
  selected?: boolean;
  xPos?: number;
  yPos?: number;
}

function MinimalNode({ data, selected }: MinimalNodeProps): JSX.Element {
  const showNode = data.showNode ?? true;
  const flowBuildStatus = useFlowStore((state) => state.flowBuildStatus);
  
  // Get build status for this node
  const buildStatus = (flowBuildStatus && data?.id && flowBuildStatus[data.id]?.status) || BuildStatus.TO_BUILD;
  
  // Get node display information
  const nodeData = data.type === "noteNode" ? data : data.node;
  const displayName = (nodeData as any)?.display_name || data.type;
  const icon = data.type === "noteNode" ? undefined : (data.node as any)?.icon;
  const isGroup = data.type !== "noteNode" && !!(data.node as any)?.flow;

  // Status-based styling (n8n-inspired)
  const getStatusStyling = () => {
    const baseClasses = "transition-all duration-200 ease-in-out";
    
    switch (buildStatus) {
      case BuildStatus.BUILDING:
        return `${baseClasses} border-warning bg-warning/5 shadow-warning/20`;
      case BuildStatus.BUILT:
        return `${baseClasses} border-success bg-success/5 shadow-success/20`;
      case BuildStatus.ERROR:
        return `${baseClasses} border-destructive bg-destructive/5 shadow-destructive/20`;
      default:
        return `${baseClasses} border-border bg-background hover:bg-muted/50`;
    }
  };

  // Selection styling
  const selectionClasses = selected
    ? "ring-2 ring-primary ring-offset-2 ring-offset-background border-primary"
    : "";

  // Status indicator dot
  const getStatusDot = () => {
    if (buildStatus === BuildStatus.BUILDING) {
      return (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full animate-pulse border-2 border-background" />
      );
    }
    if (buildStatus === BuildStatus.BUILT) {
      return (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background" />
      );
    }
    if (buildStatus === BuildStatus.ERROR) {
      return (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full border-2 border-background" />
      );
    }
    return null;
  };

  return (
    <div
      className={cn(
        // Base styling - n8n inspired dimensions
        "relative w-[140px] h-[80px] rounded-lg border-2 shadow-sm",
        "flex flex-col items-center justify-center p-3",
        "cursor-pointer group",
        // Status and interaction styling
        getStatusStyling(),
        selectionClasses,
        // Hover effects
        "hover:shadow-md hover:scale-[1.02]",
        // Group node styling
        isGroup && "border-dashed"
      )}
      data-testid={`minimal-node-${data.id}`}
    >
      {/* Status indicator dot */}
      {getStatusDot()}

      {/* Node icon */}
      <div className="flex-shrink-0 mb-2">
        <NodeIcon
          dataType={data.type}
          showNode={true}
          icon={icon}
          isGroup={isGroup}
          hasToolMode={false}
        />
      </div>

      {/* Node name */}
      <div className="flex-1 flex items-center justify-center text-center min-h-0">
        <span 
          className={cn(
            "text-xs font-medium leading-tight text-foreground",
            "line-clamp-2 break-words max-w-full",
            // Truncate long names gracefully
            "overflow-hidden"
          )}
          title={displayName} // Show full name on hover
        >
          {displayName}
        </span>
      </div>

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        className={cn(
          "w-3 h-3 border-2 border-background",
          "bg-muted-foreground hover:bg-primary",
          "transition-colors duration-200"
        )}
        style={{ left: -6 }}
      />
      
      <Handle
        type="source"
        position={Position.Right}
        className={cn(
          "w-3 h-3 border-2 border-background",
          "bg-muted-foreground hover:bg-primary",
          "transition-colors duration-200"
        )}
        style={{ right: -6 }}
      />
    </div>
  );
}

export default memo(MinimalNode); 