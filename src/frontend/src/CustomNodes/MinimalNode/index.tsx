import React, { useCallback, useMemo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { cn } from "@/utils/utils";
import { NodeIcon } from "../GenericNode/components/nodeIcon";
import useFlowStore from "@/stores/flowStore";
import { NodeDataType } from "@/types/flow";
import { BuildStatus } from "@/constants/enums";
import "./MinimalNode.css";

// MinimalNode component props (extends ReactFlow's NodeProps)
interface MinimalNodeProps extends NodeProps {
  data: NodeDataType;
  onClick?: (event: React.MouseEvent, node: any) => void;
}

const MinimalNode: React.FC<MinimalNodeProps> = ({
  id,
  data,
  selected = false,
  dragging = false,
  onClick,
  ...nodeProps
}) => {
  const setSelectedNodeId = useFlowStore((state) => state.setSelectedNodeId);
  const setParameterPanelOpen = useFlowStore((state) => state.setParameterPanelOpen);

  // Extract node data safely
  const nodeData = useMemo(() => {
    if (!data || data.type === "noteNode") return null;
    return data.node || null;
  }, [data]);

  // Extract display properties
  const displayProperties = useMemo(() => {
    if (!nodeData) return { displayName: "Note", description: "", icon: null };
    
    return {
      displayName: nodeData.display_name || data?.type || "Unknown",
      description: nodeData.description || "",
      icon: nodeData.icon,
    };
  }, [nodeData, data?.type]);

  // Get status from data and normalize it
  const status = useMemo(() => {
    const buildStatus = data?.buildStatus;
    
    // Map BuildStatus enum to display status
    switch (buildStatus) {
      case BuildStatus.BUILDING:
        return 'building';
      case BuildStatus.BUILT:
        return 'success';
      case BuildStatus.ERROR:
        return 'error';
      case BuildStatus.TO_BUILD:
        return 'idle';
      case BuildStatus.INACTIVE:
        return 'idle';
      default:
        return 'idle';
    }
  }, [data?.buildStatus]);

  // Click handler
  const handleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (onClick) {
      onClick(event, { id, data, selected, dragging, ...nodeProps });
    } else {
      // Default behavior - open parameter panel
      setSelectedNodeId(id);
      setParameterPanelOpen(true);
    }
  }, [onClick, id, data, selected, dragging, nodeProps, setSelectedNodeId, setParameterPanelOpen]);

  // Keyboard handler
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick(event as any);
    }
  }, [handleClick]);

  // Node styling
  const nodeStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      width: '140px',
      height: '80px',
      border: selected ? '2px solid hsl(var(--primary))' : '1px solid hsl(var(--border))',
      borderRadius: '8px',
      backgroundColor: 'hsl(var(--background))',
      boxShadow: dragging 
        ? '0 8px 24px rgba(0, 0, 0, 0.15)' 
        : selected 
          ? '0 4px 12px rgba(0, 0, 0, 0.1)' 
          : '0 1px 3px rgba(0, 0, 0, 0.05)',
      transform: dragging ? 'scale(1.02)' : 'scale(1)',
      transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '12px',
      position: 'relative',
    };

    // Status-specific styling
    switch (status) {
      case 'building':
        baseStyle.borderColor = 'hsl(var(--warning))';
        baseStyle.backgroundColor = 'hsl(var(--warning) / 0.05)';
        baseStyle.animation = 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite';
        break;
      case 'success':
        baseStyle.borderColor = 'hsl(var(--success))';
        baseStyle.backgroundColor = 'hsl(var(--success) / 0.05)';
        break;
      case 'error':
        baseStyle.borderColor = 'hsl(var(--destructive))';
        baseStyle.backgroundColor = 'hsl(var(--destructive) / 0.05)';
        break;
      case 'idle':
      default:
        // Keep default styling
        break;
    }

    return baseStyle;
  }, [selected, dragging, status]);

  // CSS classes
  const nodeClasses = useMemo(() => {
    return cn(
      "minimal-node",
      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
      {
        "minimal-node--selected": selected,
        "minimal-node--dragging": dragging,
        "minimal-node--idle": status === 'idle',
        "minimal-node--building": status === 'building',
        "minimal-node--success": status === 'success',
        "minimal-node--error": status === 'error',
      }
    );
  }, [selected, dragging, status]);

  // Handle note nodes
  if (data?.type === "noteNode") {
    return (
      <div
        className="note-node"
        style={{ width: '140px', height: '80px' }}
        data-node-id={id}
      >
        <div className="note-content">
          {(data as any)?.value || "Note"}
        </div>
      </div>
    );
  }

  return (
    <div
      className={nodeClasses}
      style={nodeStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${displayProperties.displayName} node`}
      aria-selected={selected}
      data-node-id={id}
      data-node-type={data?.type || "unknown"}
      data-testid={`minimal-node-${id}`}
    >
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="minimal-node__handle minimal-node__handle--target"
        style={{
          left: -6,
          width: 12,
          height: 12,
          border: '2px solid hsl(var(--background))',
          backgroundColor: 'hsl(var(--primary))',
        }}
      />
      
      {/* Node Content */}
      <div className="minimal-node__content">
        {/* Node Icon */}
        <div className="minimal-node__icon">
          <NodeIcon
            dataType={data?.type || "unknown"}
            showNode={true}
            icon={displayProperties.icon || undefined}
            isGroup={!!(nodeData as any)?.flow}
            hasToolMode={false}
          />
        </div>
        
        {/* Node Label */}
        <div className="minimal-node__label">
          <span className="minimal-node__name">
            {displayProperties.displayName}
          </span>
          {status === 'building' && (
            <div className="minimal-node__status-indicator">
              <div className="minimal-node__pulse" />
            </div>
          )}
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="minimal-node__handle minimal-node__handle--source"
        style={{
          right: -6,
          width: 12,
          height: 12,
          border: '2px solid hsl(var(--background))',
          backgroundColor: 'hsl(var(--primary))',
        }}
      />

      {/* Status Overlay for Error/Success */}
      {(status === 'error' || status === 'success') && (
        <div className={`minimal-node__status-overlay minimal-node__status-overlay--${status}`}>
          <div className="minimal-node__status-icon">
            {status === 'success' ? '✓' : '✕'}
          </div>
        </div>
      )}
    </div>
  );
};

export default MinimalNode; 