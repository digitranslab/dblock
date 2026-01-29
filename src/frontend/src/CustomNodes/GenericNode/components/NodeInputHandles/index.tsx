import { getNodeInputColors } from "@/CustomNodes/helpers/get-node-input-colors";
import { getNodeInputColorsName } from "@/CustomNodes/helpers/get-node-input-colors-name";
import { sortToolModeFields } from "@/CustomNodes/helpers/sort-tool-mode-field";
import { KOZMOAI_SUPPORTED_TYPES } from "@/constants/constants";
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

// Known INPUT component types that should have no input handles (they are data sources)
const INPUT_COMPONENT_TYPES = [
  "ChatInput",
  "TextInput",
  "CronTrigger",
];

/**
 * Renders a single unified input handle at the top center of the node.
 * The unified handle accepts all compatible input types from the component's template.
 * Type compatibility is still enforced during edge connection validation.
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

  // Collect all input types from all fields that would have handles
  const unifiedInputData = useMemo(() => {
    const allInputTypes: string[] = [];
    const allFieldNames: string[] = [];
    let primaryType = "Message";
    
    const fields = Object.keys(data.node?.template || {})
      .filter((templateField) => templateField.charAt(0) !== "_")
      .sort((a, b) =>
        sortToolModeFields(
          a,
          b,
          data.node!.template,
          data.node?.field_order ?? [],
          isToolMode,
        ),
      )
      .filter((templateField) => {
        const template = data.node?.template[templateField];
        if (!template?.show || template?.advanced) return false;
        
        const type = template.type;
        const optionalHandle = template.input_types;
        const shouldDisplayHandle =
          (!KOZMOAI_SUPPORTED_TYPES.has(type ?? "") ||
            (optionalHandle && optionalHandle.length > 0)) &&
          !(isToolMode && template.tool_mode);
        
        return shouldDisplayHandle;
      });
    
    // Collect all unique input types from all fields
    fields.forEach((templateField) => {
      const template = data.node?.template[templateField];
      if (template) {
        allFieldNames.push(templateField);
        if (template.input_types) {
          template.input_types.forEach((inputType: string) => {
            if (!allInputTypes.includes(inputType)) {
              allInputTypes.push(inputType);
            }
          });
        }
        if (template.type && !allInputTypes.includes(template.type)) {
          allInputTypes.push(template.type);
        }
        // Use the first field's type as primary
        if (allFieldNames.length === 1) {
          primaryType = template.type || "Message";
        }
      }
    });
    
    return {
      hasInputs: fields.length > 0,
      inputTypes: allInputTypes.length > 0 ? allInputTypes : ["Message", "Text"],
      primaryType,
      fieldNames: allFieldNames,
      // Use the first field name for backwards compatibility with existing edges
      primaryFieldName: allFieldNames[0] || "input_value",
    };
  }, [data.node?.template, data.node?.field_order, isToolMode]);

  // Check if this is an INPUT component (no input handles - they are data sources)
  // Use both hardcoded list and dynamic check from backend data
  const isInputComponent = INPUT_COMPONENT_TYPES.includes(data.type) ||
    (myData?.inputs && Object.keys(myData.inputs).includes(data.type));
  
  // Don't render input handle for input components or if no inputs
  if (isInputComponent || !unifiedInputData.hasInputs) return null;

  // All input handles are grey
  const colors = getNodeInputColors(
    unifiedInputData.inputTypes,
    unifiedInputData.primaryType,
    types,
  );
  const colorName = getNodeInputColorsName(
    unifiedInputData.inputTypes,
    unifiedInputData.primaryType,
    types,
  );

  return (
    <div 
      className="absolute left-0 right-0 top-0 z-50 flex justify-center" 
      style={{ transform: "translateY(-5px)" }}
    >
      <div 
        className="relative"
        style={{ width: "10px", height: "10px" }}
      >
        <HandleRenderComponent
          left={true}
          nodes={nodes}
          tooltipTitle={unifiedInputData.inputTypes.join("\n")}
          proxy={undefined}
          id={{
            inputTypes: unifiedInputData.inputTypes,
            type: unifiedInputData.primaryType,
            id: data.id,
            fieldName: unifiedInputData.primaryFieldName,
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
  );
});

export default NodeInputHandles;
