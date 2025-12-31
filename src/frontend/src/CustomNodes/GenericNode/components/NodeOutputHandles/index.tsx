import { getNodeOutputColors } from "@/CustomNodes/helpers/get-node-output-colors";
import { getNodeOutputColorsName } from "@/CustomNodes/helpers/get-node-output-colors-name";
import useFlowStore from "@/stores/flowStore";
import { useTypesStore } from "@/stores/typesStore";
import { NodeDataType } from "@/types/flow";
import { memo, useMemo } from "react";
import HandleRenderComponent from "../handleRenderComponent";

interface NodeOutputHandlesProps {
  data: NodeDataType;
  showNode: boolean;
  shownOutputs: any[];
  showHiddenOutputs: boolean;
}

/**
 * Renders all output handles at the bottom of the node for vertical layout.
 * Handles are distributed horizontally across the bottom edge.
 */
const NodeOutputHandles = memo(function NodeOutputHandles({
  data,
  showNode,
  shownOutputs,
  showHiddenOutputs,
}: NodeOutputHandlesProps) {
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const myData = useTypesStore((state) => state.data);
  const types = useTypesStore((state) => state.types);
  const setFilterEdge = useFlowStore((state) => state.setFilterEdge);

  // Get outputs to display
  const outputsToRender = useMemo(() => {
    if (showHiddenOutputs) {
      return data.node?.outputs ?? [];
    }
    return shownOutputs;
  }, [data.node?.outputs, shownOutputs, showHiddenOutputs]);

  const handleCount = outputsToRender.length;
  
  if (handleCount === 0) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 flex justify-center" style={{ transform: "translateY(50%)" }}>
      <div 
        className="flex items-center justify-center"
        style={{ 
          gap: "24px", // Increased spacing between handles
          minWidth: handleCount > 1 ? `${handleCount * 56}px` : "auto",
        }}
      >
        {outputsToRender.map((output, idx) => {
          if (!output) return null;

          const id = {
            output_types: [output.selected ?? output.types[0]],
            id: data.id,
            dataType: data.type,
            name: output.name,
          };

          const colors = getNodeOutputColors(output, data, types);
          const colorNames = getNodeOutputColorsName(output, data, types);

          return (
            <div key={`output-handle-${output.name}-${idx}`} className="relative">
              <HandleRenderComponent
                left={false}
                nodes={nodes}
                tooltipTitle={output.selected ?? output.types[0]}
                id={id}
                title={output.display_name ?? output.name}
                edges={edges}
                myData={myData}
                colors={colors}
                setFilterEdge={setFilterEdge}
                showNode={showNode}
                testIdComplement={`${data?.type?.toLowerCase()}-${showNode ? "shownode" : "noshownode"}`}
                nodeId={data.id}
                colorName={colorNames}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default NodeOutputHandles;
