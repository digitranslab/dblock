import { getNodeInputColors } from "@/CustomNodes/helpers/get-node-input-colors";
import { getNodeInputColorsName } from "@/CustomNodes/helpers/get-node-input-colors-name";
import { sortToolModeFields } from "@/CustomNodes/helpers/sort-tool-mode-field";
import getFieldTitle from "@/CustomNodes/utils/get-field-title";
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

/**
 * Renders all input handles at the top of the node for vertical layout.
 * Handles are distributed horizontally across the top edge.
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

  // Get all template fields that should have handles
  const handleFields = useMemo(() => {
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
    
    return fields;
  }, [data.node?.template, data.node?.field_order, isToolMode]);

  // Calculate horizontal positions for handles
  const handleCount = handleFields.length;
  
  if (handleCount === 0) return null;

  return (
    <div className="absolute left-0 right-0 top-0 z-50 flex justify-center" style={{ transform: "translateY(-50%)" }}>
      <div 
        className="flex items-center justify-center"
        style={{ 
          gap: "24px", // Increased spacing between handles
          minWidth: handleCount > 1 ? `${handleCount * 56}px` : "auto",
        }}
      >
        {handleFields.map((templateField, idx) => {
          const template = data.node?.template[templateField];
          if (!template) return null;

          const colors = getNodeInputColors(
            template.input_types,
            template.type,
            types,
          );
          const colorName = getNodeInputColorsName(
            template.input_types,
            template.type,
            types,
          );

          return (
            <div key={`input-handle-${templateField}-${idx}`} className="relative">
              <HandleRenderComponent
                left={true}
                nodes={nodes}
                tooltipTitle={template.input_types?.join("\n") ?? template.type}
                proxy={template.proxy}
                id={{
                  inputTypes: template.input_types,
                  type: template.type,
                  id: data.id,
                  fieldName: templateField,
                }}
                title={getFieldTitle(data.node?.template!, templateField)}
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
          );
        })}
      </div>
    </div>
  );
});

export default NodeInputHandles;
