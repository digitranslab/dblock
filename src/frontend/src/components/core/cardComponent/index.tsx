import { track } from "@/customization/utils/analytics";
import { useState } from "react";
import { Control } from "react-hook-form";
import useAlertStore from "../../../stores/alertStore";
import useFlowsManagerStore from "../../../stores/flowsManagerStore";
import { FlowType } from "../../../types/flow";
import { getInputsAndOutputs } from "../../../utils/storeUtils";
import { cn } from "../../../utils/utils";
import IconComponent from "../../common/genericIconComponent";
import ShadTooltip from "../../common/shadTooltipComponent";
import { Button } from "../../ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Checkbox } from "../../ui/checkbox";
import { FormControl, FormField } from "../../ui/form";
import useDragStart from "./hooks/use-on-drag-start";
import { convertTestName } from "./utils/convert-test-name";

type NodeStatus = "idle" | "running" | "success" | "error";

export default function CollectionCardComponent({
  data,
  disabled = false,
  onClick,
  control,
  status = "idle",
}: {
  data: FlowType;
  disabled?: boolean;
  onClick?: () => void;
  control?: Control<any, any>;
  status?: NodeStatus;
}) {
  const setErrorData = useAlertStore((state) => state.setErrorData);
  const setCurrentFlow = useFlowsManagerStore((state) => state.setCurrentFlow);
  const getFlowById = useFlowsManagerStore((state) => state.getFlowById);
  const [loadingPlayground, setLoadingPlayground] = useState(false);
  const selectedFlowsComponentsCards = useFlowsManagerStore(
    (state) => state.selectedFlowsComponentsCards,
  );
  const [isHovered, setIsHovered] = useState(false);

  function hasPlayground(flow?: FlowType) {
    if (!flow) {
      return false;
    }
    const { inputs, outputs } = getInputsAndOutputs(flow?.data?.nodes ?? []);
    return inputs.length > 0 || outputs.length > 0;
  }
  const playground = !(data.is_component ?? false);
  const isSelectedCard =
    selectedFlowsComponentsCards?.includes(data?.id) ?? false;

  const { onDragStart } = useDragStart(data);

  const handlePlaygroundClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    track("Playground Button Clicked", { flowId: data.id });
    setLoadingPlayground(true);

    if (data) {
      if (!hasPlayground(data)) {
        setErrorData({
          title: "Error",
          list: ["This flow doesn't have a playground."],
        });
        setLoadingPlayground(false);
        return;
      }
      setCurrentFlow(data);
      setLoadingPlayground(false);
    } else {
      setErrorData({
        title: "Error",
        list: ["Error getting flow data."],
      });
    }
  };

  // Status indicator classes with improved styling
  const statusClasses = {
    idle: "before:bg-muted-foreground/30",
    running: "before:bg-status-blue",
    success: "before:bg-status-green",
    error: "before:bg-status-red",
  };

  // Status display names and colors for the badge
  const statusConfig = {
    idle: {
      label: "Idle",
      dotClass: "bg-muted-foreground/50",
      bgClass: "bg-muted-foreground/10",
      textClass: "text-muted-foreground",
    },
    running: {
      label: "Running",
      dotClass: "bg-status-blue",
      bgClass: "bg-status-blue/10",
      textClass: "text-status-blue",
    },
    success: {
      label: "Success",
      dotClass: "bg-status-green",
      bgClass: "bg-status-green/10",
      textClass: "text-status-green",
    },
    error: {
      label: "Error",
      dotClass: "bg-status-red",
      bgClass: "bg-status-red/10",
      textClass: "text-status-red",
    },
  };

  return (
    <>
      <Card
        onDragStart={onDragStart}
        draggable
        data-testid={`card-${convertTestName(data.name)}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          // Base card styles
          "group relative flex h-[11rem] flex-col justify-between overflow-hidden",
          // Modern floating card design with shadows
          "border border-border/40 bg-card shadow-sm transition-all duration-300",
          // Status indicator styling with pseudo-element
          "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:transition-colors before:duration-300",
          // Status-specific styles
          statusClasses[status],
          // Add pulse animation only on hover for running status
          status === "running" && isHovered && "animate-pulse",
          // Hover and selection states
          !data.is_component &&
            "hover:border-primary/40 hover:shadow-md dark:hover:border-primary/40",
          isSelectedCard && "border-selected shadow-md",
          // Interactive states
          disabled ? "pointer-events-none opacity-50" : "",
          onClick ? "cursor-pointer" : "",
          // Rounded corners
          "rounded-lg",
        )}
        onClick={onClick}
        style={{
          // Dynamic styles for better visual hierarchy
          transform: isHovered ? "translateY(-2px)" : "translateY(0)",
          transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.3s ease",
        }}
      >
        <div className="flex flex-1 flex-col">
          <CardHeader className="p-3 pb-0">
            <div>
              <CardTitle className="flex w-full items-center gap-3 text-xl">
                <div className={cn(
                  "flex items-center justify-center rounded-md p-1.5",
                  data.is_component 
                    ? "bg-secondary-tint-3 text-secondary" 
                    : "bg-primary-tint-3 text-primary"
                )}>
                  <IconComponent
                    className={cn(
                      "h-5 w-5",
                      data.is_component
                        ? "text-component-icon"
                        : "text-flow-icon",
                    )}
                    name={data.is_component ? "ToyBrick" : "Group"}
                  />
                </div>
                <ShadTooltip content={data.name}>
                  <div className="w-full truncate pr-3 text-lg font-medium">{data.name}</div>
                </ShadTooltip>
                {control && (
                  <div
                    className="flex"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <FormField
                      control={control}
                      name={`${data.id}`}
                      defaultValue={false}
                      render={({ field }) => (
                        <FormControl>
                          <Checkbox
                            data-testid={`checkbox-component`}
                            aria-label="checkbox-component"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="h-5 w-5 border border-ring data-[state=checked]:border-selected data-[state=checked]:bg-selected"
                          />
                        </FormControl>
                      )}
                    />
                  </div>
                )}
              </CardTitle>
            </div>
            <div className="flex gap-2 mt-1">
              <div className="flex w-full flex-1 flex-wrap gap-2">
                {/* Status badge - always visible now */}
                <div className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  statusConfig[status].bgClass,
                  statusConfig[status].textClass
                )}>
                  <div className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    statusConfig[status].dotClass,
                    // Add pulse animation only on hover for running status
                    status === "running" && isHovered && "animate-pulse"
                  )}></div>
                  {statusConfig[status].label}
                </div>
              </div>
            </div>
            <CardDescription className="pt-2 pb-0 text-sm">
              <div className="truncate-doubleline text-muted-foreground">{data.description}</div>
            </CardDescription>
          </CardHeader>
        </div>
        <CardFooter className="p-3 pt-0">
          <div className="z-50 flex w-full items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Removed the status indicator from here since we moved it above */}
            </div>
            <div className="flex w-full flex-wrap items-end justify-end gap-2">
              {playground && hasPlayground(data) && (
                <Button
                  disabled={loadingPlayground}
                  key={data.id}
                  tabIndex={-1}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "gap-2 whitespace-nowrap border-border/40 bg-background transition-colors",
                    "hover:border-primary/40 hover:bg-primary-tint-3 hover:text-primary",
                    "text-sm font-medium"
                  )}
                  data-testid={"playground-flow-button-" + data.id}
                  onClick={handlePlaygroundClick}
                >
                  <IconComponent
                    name="BotMessageSquareIcon"
                    className="h-4 w-4 select-none"
                  />
                  Playground
                </Button>
              )}
            </div>
          </div>
        </CardFooter>
        
        {/* Toolbar that appears on hover - similar to n8n's design */}
        <div className={cn(
          "absolute -top-8 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-md bg-background p-1 shadow-md transition-all duration-200",
          isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <ShadTooltip content="Run">
            <Button
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-md hover:bg-primary-tint-3 hover:text-primary"
            >
              <IconComponent name="Play" className="h-4 w-4" />
            </Button>
          </ShadTooltip>
          <ShadTooltip content="Edit">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-md hover:bg-primary-tint-3 hover:text-primary"
            >
              <IconComponent name="Pencil" className="h-4 w-4" />
            </Button>
          </ShadTooltip>
          <ShadTooltip content="Delete">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-md hover:bg-destructive-tint-1 hover:text-destructive"
            >
              <IconComponent name="Trash" className="h-4 w-4" />
            </Button>
          </ShadTooltip>
        </div>
      </Card>
    </>
  );
}
