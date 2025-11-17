// Zoom slider control for canvas
import { Slider } from "@/components/ui/slider";
import ForwardedIconComponent from "@/components/common/genericIconComponent";
import { motion } from "framer-motion";
import { cn } from "@/utils/utils";

interface ZoomSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function ZoomSlider({
  value,
  onChange,
  min = 0.1,
  max = 2,
  step = 0.1,
  className,
}: ZoomSliderProps) {
  const percentage = Math.round(value * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-background p-3 shadow-lg",
        className
      )}
    >
      <ForwardedIconComponent
        name="ZoomOut"
        className="h-4 w-4 text-muted-foreground"
      />

      <div className="flex items-center gap-2">
        <Slider
          value={[value]}
          onValueChange={(values) => onChange(values[0])}
          min={min}
          max={max}
          step={step}
          className="w-32"
        />
        <span className="min-w-[3rem] text-sm font-medium tabular-nums">
          {percentage}%
        </span>
      </div>

      <ForwardedIconComponent
        name="ZoomIn"
        className="h-4 w-4 text-muted-foreground"
      />
    </motion.div>
  );
}
