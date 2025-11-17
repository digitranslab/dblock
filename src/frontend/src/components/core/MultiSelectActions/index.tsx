// Multi-select actions for connections
import { Button } from "@/components/ui/button";
import ForwardedIconComponent from "@/components/common/genericIconComponent";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/utils";

interface MultiSelectActionsProps {
  selectedCount: number;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onGroup?: () => void;
  onClear?: () => void;
  position?: { x: number; y: number };
  className?: string;
}

export function MultiSelectActions({
  selectedCount,
  onDelete,
  onDuplicate,
  onGroup,
  onClear,
  position,
  className,
}: MultiSelectActionsProps) {
  const visible = selectedCount > 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex items-center gap-2 rounded-lg border bg-background p-2 shadow-lg",
            className
          )}
          style={
            position
              ? {
                  position: "absolute",
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                }
              : undefined
          }
        >
          {/* Selection count */}
          <div className="flex items-center gap-2 px-2">
            <span className="text-sm font-medium">
              {selectedCount} selected
            </span>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            {onDuplicate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDuplicate}
                className="h-8 gap-2"
              >
                <ForwardedIconComponent name="Copy" className="h-4 w-4" />
                Duplicate
              </Button>
            )}

            {onGroup && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onGroup}
                className="h-8 gap-2"
              >
                <ForwardedIconComponent name="Group" className="h-4 w-4" />
                Group
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-8 gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <ForwardedIconComponent name="Trash2" className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>

          {onClear && (
            <>
              <div className="h-6 w-px bg-border" />
              <Button
                variant="ghost"
                size="icon"
                onClick={onClear}
                className="h-8 w-8"
              >
                <ForwardedIconComponent name="X" className="h-4 w-4" />
              </Button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
