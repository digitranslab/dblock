// Enhanced drag preview component with visual feedback
import { motion } from "framer-motion";
import { APIClassType } from "@/types/api";
import ForwardedIconComponent from "@/components/common/genericIconComponent";

interface DragPreviewProps {
  node: APIClassType;
  type: string;
}

export function DragPreview({ node, type }: DragPreviewProps) {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="pointer-events-none w-[215px] rounded-lg border-2 border-primary bg-background p-3 shadow-2xl"
    >
      <div className="flex items-center gap-2">
        {node.icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
            <ForwardedIconComponent
              name={node.icon}
              className="h-5 w-5 text-primary"
            />
          </div>
        )}
        <div className="flex-1 truncate">
          <div className="truncate font-medium text-sm">
            {node.display_name}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {node.description}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
