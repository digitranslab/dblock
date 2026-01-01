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

// Known input component types that should only have Success output
const INPUT_COMPONENT_TYPES = [
  "ChatInput",
  "TextInput", 
  "Prompt",
  "CronTrigger",
];

// Known output component types that should have no output handles
const OUTPUT_COMPONENT_TYPES = [
  "ChatOutput",
  "TextOutput",
];

/**
 * Renders all output handles at the bottom of the node for vertical layout.
 * - Output components (ChatOutput, TextOutput): no output handles
 * - Input components (ChatInput, TextInput, Prompt, CronTrigger): only Success (green) handle
 * - All other components: Success (green) and Else (orange) handles
 */
const NodeOutputHandles = memo(function NodeOutputHandles({
  data,
  showNode,
}: NodeOutputHandlesProps) {
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const myData = useTypesStore((state) => state.data);
  const types = useTypesStore((state) => state.types);
  const setFilterEdge = useFlowStore((state) => state.setFilterEdge);

  // Get the primary output type from the component's outputs
  const primaryOutputType = useMemo(() => {
    const outputs = data.node?.outputs ?? [];
    if (outputs.length > 0) {
      return outputs[0].selected ?? outputs[0].types?.[0] ?? "Message";
    }
    return "Message";
  }, [data.node?.outputs]);

  // Determine component category and generate appropriate outputs
  const outputsToRender = useMemo(() => {
    const componentType = data.type;
    
    // Check if output component (no handles) - use both hardcoded list and dynamic check
    const isOutputComponent = OUTPUT_COMPONENT_TYPES.includes(componentType) ||
      (myData?.outputs && Object.keys(myData.outputs).includes(componentType));
    if (isOutputComponent) {
      return [];
    }
    
    // Check if input component (only Success handle) - use both hardcoded list and dynamic check
    const isInputComponent = INPUT_COMPONENT_TYPES.includes(componentType) ||
      (myData?.inputs && Object.keys(myData.inputs).includes(componentType));
    if (isInputComponent) {
      return [
        {
          name: "success_output",
          display_name: "Success",
          types: [primaryOutputType],
          selected: primaryOutputType,
          output_category: "success" as const,
        },
      ];
    }
    
    // All other components get Success and Else handles
    return [
      {
        name: "success_output",
        display_name: "Success",
        types: [primaryOutputType],
        selected: primaryOutputType,
        output_category: "success" as const,
      },
      {
        name: "else_output",
        display_name: "Else",
        types: [primaryOutputType],
        selected: primaryOutputType,
        output_category: "else" as const,
      },
    ];
  }, [data.type, myData?.outputs, myData?.inputs, primaryOutputType]);

  const handleCount = outputsToRender.length;
  
  if (handleCount === 0) return null;

  return (
    <div 
      className="absolute bottom-0 left-0 right-0 z-50 flex justify-center" 
      style={{ transform: "translateY(4px)" }}
    >
      <div 
        className="flex items-center justify-center"
        style={{ 
          gap: "16px", // 16px gap between handles per spec
        }}
      >
        {outputsToRender.map((output, idx) => {
          const id = {
            output_types: [output.selected ?? output.types[0]],
            id: data.id,
            dataType: data.type,
            name: output.name,
          };

          const colors = getNodeOutputColors(output, data, types);
          const colorNames = getNodeOutputColorsName(output, data, types);

          return (
            <HandleRenderComponent
              key={`output-handle-${output.name}-${idx}`}
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
              outputCategory={output.output_category}
            />
          );
        })}
      </div>
    </div>
  );
});

export default NodeOutputHandles;
