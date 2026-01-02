import { cn } from "@/utils/utils";
import { Button } from "../../ui/button";
import { gradients } from "@/utils/styleUtils";

type GradientChooserComponentProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function GradientChooserComponent({
  value,
  onChange,
}: GradientChooserComponentProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {gradients.map((gradient, index) => (
        <Button
          key={index}
          unstyled
          onClick={() => onChange(gradient)}
          className={cn(
            "h-12 w-12 shrink-0 rounded-full",
            gradient,
            value === gradient && "ring-2 ring-primary ring-offset-2"
          )}
        />
      ))}
    </div>
  );
}
