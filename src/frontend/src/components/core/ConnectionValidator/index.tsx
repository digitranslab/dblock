// Connection validation preview component
import { motion, AnimatePresence } from "framer-motion";
import ForwardedIconComponent from "@/components/common/genericIconComponent";
import { cn } from "@/utils/utils";

interface ConnectionValidatorProps {
  isValid: boolean;
  message?: string;
  position: { x: number; y: number };
  visible: boolean;
}

export function ConnectionValidator({
  isValid,
  message,
  position,
  visible,
}: ConnectionValidatorProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute z-50"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 shadow-lg",
              isValid
                ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
                : "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400"
            )}
          >
            <ForwardedIconComponent
              name={isValid ? "CheckCircle2" : "XCircle"}
              className="h-4 w-4"
            />
            <span className="text-sm font-medium">
              {message || (isValid ? "Valid connection" : "Invalid connection")}
            </span>
          </div>

          {/* Arrow pointing down */}
          <div
            className={cn(
              "absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-8 border-transparent",
              isValid ? "border-t-green-500" : "border-t-red-500"
            )}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
