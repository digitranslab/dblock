import React, { useCallback, useEffect, useMemo } from "react";
import { X, Settings, Info, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../utils/utils";
import useFlowStore from "../../stores/flowStore";
import { NodeIcon } from "../../CustomNodes/GenericNode/components/nodeIcon";
import { EditNodeComponent } from "../../modals/editNodeModal/components/editNodeComponent";
import { Badge } from "../ui/badge";

interface ParameterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ParameterPanel({ isOpen, onClose }: ParameterPanelProps) {
  const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
  const nodes = useFlowStore((state) => state.nodes);

  // Get the selected node
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find(node => node.id === selectedNodeId);
  }, [selectedNodeId, nodes]);

  // Close panel when clicking outside
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    // Only close if clicking directly on the backdrop, not on any child elements
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Close panel on ESC key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  // Handle close button click
  const handleCloseClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  }, [onClose]);

  if (!isOpen || !selectedNode) return null;

  const nodeData = selectedNode.type === "noteNode" ? selectedNode.data : selectedNode.data.node;
  const displayName = (nodeData as any)?.display_name || selectedNode.data.type;
  const description = (nodeData as any)?.description || "";
  const icon = selectedNode.type === "noteNode" ? undefined : (nodeData as any)?.icon;
  const isGroup = selectedNode.type !== "noteNode" && !!(nodeData as any)?.flow;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/20 backdrop-blur-sm",
          "transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={handleBackdropClick}
      />
      
      {/* Panel */}
      <div
        data-parameter-panel="true"
        className={cn(
          "fixed top-0 right-0 h-full z-50",
          "w-[480px] bg-background border-l border-border",
          "shadow-2xl",
          "transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Node Icon */}
            <div className="flex-shrink-0">
              <NodeIcon
                dataType={selectedNode.data.type}
                showNode={true}
                icon={icon}
                isGroup={isGroup}
                hasToolMode={false}
              />
            </div>
            
            {/* Node Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-foreground truncate">
                  {displayName}
                </h2>
                {isGroup && (
                  <Badge variant="secondary" className="text-xs">
                    Group
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {selectedNode.data.type}
              </p>
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={handleCloseClick}
            className="flex-shrink-0 ml-2 h-8 w-8 p-0 hover:bg-muted rounded-md flex items-center justify-center transition-colors"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* Description Section */}
          {description && (
            <div className="p-6 border-b border-border bg-muted/10">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          )}

          {/* Parameters Section */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-foreground">
                  Configuration
                </h3>
              </div>
              
              {/* Parameter Form */}
              <div className="space-y-4">
                {selectedNode.type !== "noteNode" && selectedNode.data.node && (
                  <EditNodeComponent
                    open={isOpen}
                    nodeId={selectedNode.id}
                    nodeClass={selectedNode.data.node}
                    autoHeight={true}
                    hideVisibility={false}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Node ID: {selectedNode.id}</span>
            <div className="flex items-center gap-1">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Esc</kbd>
              <span>to close</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 