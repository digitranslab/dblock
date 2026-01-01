import { getNodeInputColors } from "@/CustomNodes/helpers/get-node-input-colors";
import { getNodeInputColorsName } from "@/CustomNodes/helpers/get-node-input-colors-name";
import useFlowStore from "@/stores/flowStore";
import { useTypesStore } from "@/stores/typesStore";
import { NodeDataType } from "@/types/flow";
import { memo, useMemo } from "react";
import HandleRenderComponent from "../handleRenderComponent";

interface NodeInputHandlesProps {
  data: NodeDataType;
  isToolMode: boolean;
  showNode: boolean;
}

// Known input component types that should have NO input handles
const INPUT_COMPONENT_TYPES = [
  "ChatInput",
  "TextInput", 
  "Prompt",
  "CronTrigger",
];

/**
 * Renders a SINGLE input handle at the top center of the node.
 * - Input components (ChatInput, TextInput, Prompt, CronTrigger): no input handle
 * - All other components: one grey input handle that accepts compatible connections
 */
const NodeInputHandles = memo(function NodeInputHandles({
  data,
  isToolMode,
  showNode,
}: NodeInputHandlesProps) {
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const myData = useTypesStore((state) => state.data);
  const types = useTypesStore((state) => state.types);
  const setFilterEdge = useFlowStore((state) => state.setFilterEdge);

  // Check if this is an input component (no input handles)
  const isInputComponent = useMemo(() => {
    const componentType = data.type;
    return INPUT_COMPONENT_TYPES.includes(componentType) ||
      (myData?.inputs && Object.keys(myData.inputs).includes(componentType));
  }, [data.type, myData?.inputs]);

  // Get all compatible input types from the component's template
  const allInputTypes = useMemo(() => {
    const inputTypesSet = new Set<string>();
    const template = data.node?.template || {};
    
    Object.keys(template)
      .filter((field) => field.charAt(0) !== "_")
      .forEach((field) => {
        const fieldTemplate = template[field];
        if (fieldTemplate?.input_types) {
          fieldTemplate.input_types.forEach((t: string) => inputTypesSet.add(t));
        }
        if (fieldTemplate?.type) {
          inputTypesSet.add(fieldTemplate.type);
        }
      });
    
    // Default to Message if no input types found
    if (inputTypesSet.size === 0) {
      inputTypesSet.add("Message");
    }
    
    return Array.from(inputTypesSet);
  }, [data.node?.template]);

  // Input components have no input handles
  if (isInputComponent) {
    return null;
  }

  const colors = getNodeInputColors(allInputTypes, allInputTypes[0], types);
  const colorName = getNodeInputColorsName(allInputTypes, allInputTypes[0], types);

  return (
    <div className="absolute left-0 right-0 top-0 z-50 flex justify-center" style={{ transform: "translateY(-50%)" }}>
      <div className="flex items-center justify-center">
        <div className="relative">
          <HandleRenderComponent
            left={true}
            nodes={nodes}
            tooltipTitle={allInputTypes.join("\n")}
            id={{
              inputTypes: allInputTypes,
              type: allInputTypes[0],
              id: data.id,
              fieldName: "unified_input",
            }}
            title="Input"
            edges={edges}
            myData={myData}
            colors={colors}
            setFilterEdge={setFilterEdge}
            showNode={showNode}
            testIdComplement={`${data?.type?.toLowerCase()}-${showNode ? "shownode" : "noshownode"}`}
            nodeId={data.id}
            colorName={colorName}
          />
        </div>
      </div>
    </div>
  );
});

export default NodeInputHandles;
