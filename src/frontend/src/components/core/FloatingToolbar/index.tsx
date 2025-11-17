// Floating toolbar for canvas controls (like n8n)
import ForwardedIconComponent from "@/components/common/genericIconComponent";
import { Button } from "@/components/ui/button";
import ShadTooltip from "@/components/common/shadTooltipComponent";
import { motion } from "framer-motion";
import { cn } from "@/utils/utils";

interface FloatingToolbarProps {
  onAddNode?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onLockCanvas?: () => void;
  isLocked?: boolean;
  className?: string;
}

export function FloatingToolbar({
  onAddNode,
  onZoomIn,
  onZoomOut,
  onFitView,
  onLockCanvas,
  isLocked = false,
  className,
}: FloatingToolbarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-center gap-1 rounded-lg border bg-background p-1.5 shadow-lg",
        className
      )}
    >
      {/* Add Node */}
      {onAddNode && (
        <ShadTooltip content="Add Node (⌘K)">
          <Button
            variant="ghost"
            size="icon"
            onClick={onAddNode}
            className="h-8 w-8"
          >
            <ForwardedIconComponent name="Plus" className="h-4 w-4" />
          </Button>
        </ShadTooltip>
      )}

      <div className="h-6 w-px bg-border" />

      {/* Zoom In */}
      {onZoomIn && (
        <ShadTooltip content="Zoom In">
          <Button
            variant="ghost"
            size="icon"
            onClick={onZoomIn}
            className="h-8 w-8"
          >
            <ForwardedIconComponent name="ZoomIn" className="h-4 w-4" />
          </Button>
        </ShadTooltip>
      )}

      {/* Zoom Out */}
      {onZoomOut && (
        <ShadTooltip content="Zoom Out">
          <Button
            variant="ghost"
            size="icon"
            onClick={onZoomOut}
            className="h-8 w-8"
          >
            <ForwardedIconComponent name="ZoomOut" className="h-4 w-4" />
          </Button>
        </ShadTooltip>
      )}

      {/* Fit View */}
      {onFitView && (
        <ShadTooltip content="Fit View">
          <Button
            variant="ghost"
            size="icon"
            onClick={onFitView}
            className="h-8 w-8"
          >
            <ForwardedIconComponent name="Maximize2" className="h-4 w-4" />
          </Button>
        </ShadTooltip>
      )}

      <div className="h-6 w-px bg-border" />

      {/* Lock/Unlock Canvas */}
      {onLockCanvas && (
        <ShadTooltip content={isLocked ? "Unlock Canvas" : "Lock Canvas"}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLockCanvas}
            className={cn(
              "h-8 w-8",
              isLocked && "bg-accent text-accent-foreground"
            )}
          >
            <ForwardedIconComponent
              name={isLocked ? "Lock" : "Unlock"}
              className="h-4 w-4"
            />
          </Button>
        </ShadTooltip>
      )}
    </motion.div>
  );
}
