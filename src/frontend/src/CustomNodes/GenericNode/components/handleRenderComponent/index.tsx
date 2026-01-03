import { useDarkStore } from "@/stores/darkStore";
import useFlowStore from "@/stores/flowStore";
import { nodeColorsName } from "@/utils/styleUtils";
import { Connection, Handle, Position } from "@xyflow/react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ShadTooltip from "../../../../components/common/shadTooltipComponent";
import {
  isValidConnection,
  scapedJSONStringfy,
} from "../../../../utils/reactflowUtils";
import { cn, groupByFamily } from "../../../../utils/utils";
import HandleTooltipComponent from "../HandleTooltipComponent";

// GitHub Actions-style handle constants
const HANDLE_STYLES = {
  size: 10,            // px - circular handles (diameter)
  defaultOpacity: 1.0,
  hoverOpacity: 1.0,
  hoverScale: 1.2,
  disabledOpacity: 0.4,  // 40% opacity for disabled/incompatible state per Req 3.4
  incompatibleOpacity: 0.3, // 30% opacity for incompatible handles during drag per Req 4.2
  transitionDuration: 150, // ms
  flashDuration: 200, // ms for connection flash animation per Req 4.3
};

// Color constants for handle types
const HANDLE_COLORS = {
  input: "#9CA3AF",      // Gray
  success: "#10B981",    // Green
  else: "#FF9500",       // Orange
  disabled: "#6B7280",   // Muted gray
};

const HandleRenderComponent = memo(function HandleRenderComponent({
  left,
  nodes,
  tooltipTitle = "",
  proxy,
  id,
  title,
  edges,
  myData,
  colors,
  setFilterEdge,
  showNode,
  testIdComplement,
  nodeId,
  colorName,
  outputCategory,
}: {
  left: boolean;
  nodes: any;
  tooltipTitle?: string;
  proxy?: any;
  id: any;
  title: string;
  edges: any;
  myData: any;
  colors: string[];
  setFilterEdge: (edges: any) => void;
  showNode: boolean;
  testIdComplement?: string;
  nodeId: string;
  colorName?: string[];
  outputCategory?: "success" | "else" | null;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [openTooltip, setOpenTooltip] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const prevEdgeCountRef = useRef(0);

  const {
    setHandleDragging,
    setFilterType,
    handleDragging,
    filterType,
    onConnect,
  } = useFlowStore(
    useCallback(
      (state) => ({
        setHandleDragging: state.setHandleDragging,
        setFilterType: state.setFilterType,
        handleDragging: state.handleDragging,
        filterType: state.filterType,
        onConnect: state.onConnect,
      }),
      [],
    ),
  );

  const dark = useDarkStore((state) => state.dark);

  // Detect new connections to this handle and trigger flash animation (Req 4.3)
  const connectedEdgesCount = useMemo(() => {
    return edges.filter((edge: any) => 
      (left && edge.target === nodeId && edge.targetHandle?.includes(nodeId)) ||
      (!left && edge.source === nodeId && edge.sourceHandle?.includes(nodeId))
    ).length;
  }, [edges, nodeId, left]);

  useEffect(() => {
    if (connectedEdgesCount > prevEdgeCountRef.current) {
      // New connection made - trigger flash
      setIsFlashing(true);
      const timer = setTimeout(() => {
        setIsFlashing(false);
      }, HANDLE_STYLES.flashDuration);
      return () => clearTimeout(timer);
    }
    prevEdgeCountRef.current = connectedEdgesCount;
  }, [connectedEdgesCount]);

  const myId = useMemo(
    () => scapedJSONStringfy(proxy ? { ...id, proxy } : id),
    [id, proxy],
  );

  const getConnection = useCallback(
    (semiConnection: {
      source?: string;
      sourceHandle?: string;
      target?: string;
      targetHandle?: string;
    }) => ({
      source: semiConnection.source ?? nodeId,
      sourceHandle: semiConnection.sourceHandle ?? myId,
      target: semiConnection.target ?? nodeId,
      targetHandle: semiConnection.targetHandle ?? myId,
    }),
    [nodeId, myId],
  );

  const {
    sameNode,
    ownHandle,
    openHandle,
    filterOpenHandle,
    filterPresent,
    currentFilter,
    isNullHandle,
    handleColor,
  } = useMemo(() => {
    const sameDraggingNode =
      (!left ? handleDragging?.target : handleDragging?.source) === nodeId;
    const sameFilterNode =
      (!left ? filterType?.target : filterType?.source) === nodeId;

    const ownDraggingHandle =
      handleDragging &&
      (left ? handleDragging?.target : handleDragging?.source) &&
      (left ? handleDragging.targetHandle : handleDragging.sourceHandle) ===
        myId;

    const ownFilterHandle =
      filterType &&
      (left ? filterType?.target : filterType?.source) === nodeId &&
      (left ? filterType.targetHandle : filterType.sourceHandle) === myId;

    const draggingOpenHandle =
      handleDragging &&
      (left ? handleDragging.source : handleDragging.target) &&
      !ownDraggingHandle
        ? isValidConnection(getConnection(handleDragging), nodes, edges)
        : false;

    const filterOpenHandle =
      filterType &&
      (left ? filterType.source : filterType.target) &&
      !ownFilterHandle
        ? isValidConnection(getConnection(filterType), nodes, edges)
        : false;

    const openHandle = filterOpenHandle || draggingOpenHandle;
    const filterPresent = handleDragging || filterType;

    const connectedEdge = edges.find(
      (edge: any) => edge.target === nodeId && edge.targetHandle === myId,
    );
    const connectedColor =
      nodeColorsName[connectedEdge?.data?.sourceHandle?.output_types[0]] ||
      "gray";

    const isNullHandle =
      filterPresent && !(openHandle || ownDraggingHandle || ownFilterHandle);

    // Determine handle color based on type and category
    let handleColor: string;
    
    if (isNullHandle) {
      // Incompatible state - muted gray
      handleColor = HANDLE_COLORS.disabled;
    } else if (left) {
      // Input handles are always gray
      handleColor = HANDLE_COLORS.input;
    } else if (outputCategory === "success") {
      // Success output - green
      handleColor = HANDLE_COLORS.success;
    } else if (outputCategory === "else") {
      // Else output - orange
      handleColor = HANDLE_COLORS.else;
    } else {
      // Default output color based on connected edge or type
      handleColor = connectedEdge
        ? `hsl(var(--datatype-${connectedColor}))`
        : colorName && colorName.length > 0
          ? `hsl(var(--datatype-${colorName[0]}))`
          : HANDLE_COLORS.input;
    }

    const handleColorName = connectedEdge
      ? connectedColor
      : colorName && colorName.length > 1
        ? "secondary-foreground"
        : colorName && colorName.length > 0
          ? "datatype-" + colorName[0]
          : "gray";

    const currentFilter = left
      ? {
          targetHandle: myId,
          target: nodeId,
          source: undefined,
          sourceHandle: undefined,
          type: tooltipTitle,
          color: handleColorName,
        }
      : {
          sourceHandle: myId,
          source: nodeId,
          target: undefined,
          targetHandle: undefined,
          type: tooltipTitle,
          color: handleColorName,
        };

    return {
      sameNode: sameDraggingNode || sameFilterNode,
      ownHandle: ownDraggingHandle || ownFilterHandle,
      openHandle,
      filterOpenHandle,
      filterPresent,
      currentFilter,
      isNullHandle,
      handleColor,
    };
  }, [
    left,
    handleDragging,
    filterType,
    nodeId,
    myId,
    nodes,
    edges,
    getConnection,
    dark,
    colors,
    colorName,
    tooltipTitle,
    outputCategory,
  ]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (event.button === 0) {
        setHandleDragging(currentFilter);
        const handleMouseUp = () => {
          setHandleDragging(undefined);
          document.removeEventListener("mouseup", handleMouseUp);
        };
        document.addEventListener("mouseup", handleMouseUp);
      }
    },
    [currentFilter, setHandleDragging],
  );

  const handleClick = useCallback(() => {
    setFilterEdge(groupByFamily(myData, tooltipTitle!, left, nodes!));
    setFilterType(currentFilter);
    if (filterOpenHandle && filterType) {
      onConnect(getConnection(filterType));
      setFilterType(undefined);
      setFilterEdge([]);
    }
  }, [
    myData,
    tooltipTitle,
    left,
    nodes,
    setFilterEdge,
    setFilterType,
    currentFilter,
    filterOpenHandle,
    filterType,
    onConnect,
    getConnection,
  ]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  const handleMouseUp = useCallback(() => setOpenTooltip(false), []);
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => e.preventDefault(),
    [],
  );

  // Generate aria-label for the handle
  const handleAriaLabel = useMemo(() => {
    const handleType = left ? "Input" : outputCategory === "success" ? "Success Output" : outputCategory === "else" ? "Else Output" : "Output";
    return `${handleType} connection point for ${title}`;
  }, [left, outputCategory, title]);

  // Compute the handle style directly on the Handle element
  const handleStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      position: "relative" as const, // Override React Flow's absolute positioning
      top: "auto",
      left: "auto",
      right: "auto",
      bottom: "auto",
      transform: "none",
      width: `${HANDLE_STYLES.size}px`,
      height: `${HANDLE_STYLES.size}px`,
      borderRadius: "50%", // Perfect circle
      backgroundColor: handleColor,
      border: "none",
      transition: `all ${HANDLE_STYLES.transitionDuration}ms ease`,
      opacity: HANDLE_STYLES.defaultOpacity,
      boxShadow: "none",
      cursor: "crosshair",
    };

    // Flash animation on successful connection
    if (isFlashing) {
      return {
        ...baseStyle,
        opacity: 1,
        boxShadow: `0 0 6px ${handleColor}`,
        transform: `scale(${HANDLE_STYLES.hoverScale})`,
      };
    }

    // Incompatible/disabled state
    if (isNullHandle) {
      return {
        ...baseStyle,
        opacity: HANDLE_STYLES.incompatibleOpacity,
        backgroundColor: HANDLE_COLORS.disabled,
      };
    }

    // Compatible handle during drag - subtle glow
    if (openHandle) {
      return {
        ...baseStyle,
        opacity: HANDLE_STYLES.hoverOpacity,
        boxShadow: `0 0 4px ${handleColor}`,
        transform: `scale(${HANDLE_STYLES.hoverScale})`,
      };
    }

    // Hover state
    if (isHovered) {
      return {
        ...baseStyle,
        opacity: HANDLE_STYLES.hoverOpacity,
        transform: `scale(${HANDLE_STYLES.hoverScale})`,
      };
    }

    return baseStyle;
  }, [handleColor, isFlashing, isNullHandle, openHandle, isHovered]);

  return (
    <div>
      <ShadTooltip
        open={openTooltip}
        setOpen={setOpenTooltip}
        styleClasses={cn(
          "tooltip-fixed-width custom-scroll nowheel bottom-2",
          "dblock-tooltip-wrapper"
        )}
        delayDuration={500}
        content={
          <HandleTooltipComponent
            isInput={left}
            tooltipTitle={tooltipTitle}
            isConnecting={!!filterPresent && !ownHandle}
            isCompatible={openHandle}
            isSameNode={sameNode && !ownHandle}
            left={left}
            outputCategory={outputCategory}
          />
        }
        side={left ? "top" : "bottom"}
      >
        <Handle
          type={left ? "target" : "source"}
          position={left ? Position.Top : Position.Bottom}
          id={myId}
          isValidConnection={(connection) =>
            isValidConnection(connection as Connection, nodes, edges)
          }
          className={cn(
            `group/handle z-50`,
            !showNode && "no-show",
          )}
          style={handleStyle}
          onClick={handleClick}
          onMouseUp={handleMouseUp}
          onContextMenu={handleContextMenu}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          data-testid={`handle-${testIdComplement}-${title.toLowerCase()}-${
            !showNode ? (left ? "target" : "source") : left ? "left" : "right"
          }`}
          aria-label={handleAriaLabel}
          tabIndex={0}
        />
      </ShadTooltip>
    </div>
  );
});

export default HandleRenderComponent;
