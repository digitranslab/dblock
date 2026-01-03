import { convertTestName } from "@/components/common/storeCardComponent/utils/convert-test-name";
import { Badge } from "@/components/ui/badge";
import { nodeColorsName } from "@/utils/styleUtils";
import { DBlockMascot } from "@/components/common/dblockMascot";

// DBlock brand colors
const DBLOCK_ORANGE = "#ffbd59";
const DBLOCK_TEXT = "#1a1a1a";
const DBLOCK_TEXT_SECONDARY = "#4a4a4a";

// Colors for success/else output categories
const SUCCESS_COLOR = "#10B981"; // Tailwind emerald-500
const ELSE_COLOR = "#FF9500"; // Light orange matching DBLOCK logo

export default function HandleTooltipComponent({
  isInput,
  tooltipTitle,
  isConnecting,
  isCompatible,
  isSameNode,
  left,
  outputCategory,
}: {
  isInput: boolean;
  tooltipTitle: string;
  isConnecting: boolean;
  isCompatible: boolean;
  isSameNode: boolean;
  left: boolean;
  outputCategory?: "success" | "else" | null;
}) {
  const tooltips = tooltipTitle.split("\n");
  const plural = tooltips.length > 1 ? "s" : "";

  // Determine display title based on output category
  const displayTitle = outputCategory 
    ? outputCategory === "success" ? "Success" : "Else"
    : null;
  
  const categoryColor = outputCategory === "success" 
    ? SUCCESS_COLOR 
    : outputCategory === "else" 
      ? ELSE_COLOR 
      : null;

  // Tooltip container styles
  const containerStyle: React.CSSProperties = {
    backgroundColor: DBLOCK_ORANGE,
    borderRadius: "12px",
    padding: "12px 16px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    minWidth: "240px",
    color: DBLOCK_TEXT,
  };

  // Render same-node error state
  if (isSameNode) {
    return (
      <div style={containerStyle} data-testid="handle-tooltip-same-node">
        <div className="flex items-start gap-3">
          <DBlockMascot size={36} />
          <div className="flex flex-col">
            <span 
              className="font-semibold text-sm"
              style={{ color: DBLOCK_TEXT }}
            >
              ⚠️ Connection Error
            </span>
            <span 
              className="text-sm mt-1"
              style={{ color: DBLOCK_TEXT_SECONDARY }}
            >
              Can't connect to the same node
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Render connecting state (compatible or incompatible)
  if (isConnecting) {
    return (
      <div 
        style={{
          ...containerStyle,
          opacity: isCompatible ? 1 : 0.9,
        }} 
        data-testid={`handle-tooltip-${isCompatible ? 'compatible' : 'incompatible'}`}
      >
        <div className="flex items-start gap-3">
          <DBlockMascot size={36} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span 
                className="font-medium text-sm"
                style={{ color: DBLOCK_TEXT }}
              >
                {isCompatible ? (
                  <>
                    <span className="font-bold">Connect</span> to
                  </>
                ) : (
                  <span style={{ color: DBLOCK_TEXT_SECONDARY }}>
                    Incompatible with
                  </span>
                )}
              </span>
              {/* Show category badge for success/else outputs */}
              {displayTitle && categoryColor ? (
                <Badge
                  className="h-6 rounded-md px-2"
                  style={{
                    backgroundColor: categoryColor,
                    color: "#FFFFFF",
                  }}
                  data-testid={`output-tooltip-${displayTitle.toLowerCase()}`}
                >
                  {displayTitle}
                </Badge>
              ) : (
                tooltips.map((word, index) => (
                  <Badge
                    className="h-6 rounded-md px-2"
                    key={`${index}-${word.toLowerCase()}`}
                    style={{
                      backgroundColor: left
                        ? `hsl(var(--datatype-${nodeColorsName[word]}))`
                        : `hsl(var(--datatype-${nodeColorsName[word]}-foreground))`,
                      color: left
                        ? `hsl(var(--datatype-${nodeColorsName[word]}-foreground))`
                        : `hsl(var(--datatype-${nodeColorsName[word]}))`,
                    }}
                    data-testid={`${isInput ? "input" : "output"}-tooltip-${convertTestName(word)}`}
                  >
                    {word}
                  </Badge>
                ))
              )}
              <span 
                className="text-sm"
                style={{ color: DBLOCK_TEXT }}
              >
                {isInput ? "input" : "output"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render default hover state with full information
  return (
    <div style={containerStyle} data-testid="handle-tooltip-default">
      <div className="flex items-start gap-3">
        <DBlockMascot size={36} />
        <div className="flex flex-col flex-1">
          {/* Type information */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span 
              className="text-xs font-medium"
              style={{ color: DBLOCK_TEXT }}
            >
              {isInput
                ? `Input${plural} type${plural}`
                : displayTitle 
                  ? "Output"
                  : `Output${plural} type${plural}`}
              :
            </span>
            {/* Show category badge for success/else outputs */}
            {displayTitle && categoryColor ? (
              <Badge
                className="h-6 rounded-md px-2"
                style={{
                  backgroundColor: categoryColor,
                  color: "#FFFFFF",
                }}
                data-testid={`output-tooltip-${displayTitle.toLowerCase()}`}
              >
                {displayTitle}
              </Badge>
            ) : (
              tooltips.map((word, index) => (
                <Badge
                  className="h-6 rounded-md px-2"
                  key={`${index}-${word.toLowerCase()}`}
                  style={{
                    backgroundColor: left
                      ? `hsl(var(--datatype-${nodeColorsName[word]}))`
                      : `hsl(var(--datatype-${nodeColorsName[word]}-foreground))`,
                    color: left
                      ? `hsl(var(--datatype-${nodeColorsName[word]}-foreground))`
                      : `hsl(var(--datatype-${nodeColorsName[word]}))`,
                  }}
                  data-testid={`${isInput ? "input" : "output"}-tooltip-${convertTestName(word)}`}
                >
                  {word}
                </Badge>
              ))
            )}
          </div>
          
          {/* Instructions */}
          <div 
            className="mt-2 flex flex-col gap-0.5 text-xs leading-5"
            style={{ color: DBLOCK_TEXT_SECONDARY }}
          >
            <div>
              <b style={{ color: DBLOCK_TEXT }}>Drag</b> to connect compatible {!isInput ? "inputs" : "outputs"}
            </div>
            <div>
              <b style={{ color: DBLOCK_TEXT }}>Click</b> to filter compatible {!isInput ? "inputs" : "outputs"} and components
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
