import useHandleNodeClass from "@/CustomNodes/hooks/use-handle-node-class";
import { usePostTemplateValue } from "@/controllers/API/queries/nodes/use-post-template-value";
import {
  CustomParameterComponent,
  CustomParameterLabel,
  getCustomParameterTitle,
} from "@/customization/components/custom-parameter";
import { cn } from "@/utils/utils";
import { useEffect, useRef } from "react";
import { default as IconComponent } from "../../../../components/common/genericIconComponent";
import ShadTooltip from "../../../../components/common/shadTooltipComponent";
import {
  DEFAULT_TOOLSET_PLACEHOLDER,
  FLEX_VIEW_TYPES,
  ICON_STROKE_WIDTH,
} from "../../../../constants/constants";
import useFlowStore from "../../../../stores/flowStore";
import { NodeInputFieldComponentType } from "../../../../types/components";
import { scapedJSONStringfy } from "../../../../utils/reactflowUtils";
import useFetchDataOnMount from "../../../hooks/use-fetch-data-on-mount";
import useHandleOnNewValue from "../../../hooks/use-handle-new-value";
import NodeInputInfo from "../NodeInputInfo";

export default function NodeInputField({
  id,
  data,
  tooltipTitle: _tooltipTitle,
  title,
  colors: _colors,
  type,
  name = "",
  required = false,
  optionalHandle = null,
  lastInput = false,
  info = "",
  proxy,
  showNode,
  colorName: _colorName,
  isToolMode = false,
}: NodeInputFieldComponentType): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const edges = useFlowStore((state) => state.edges);
  const postTemplateValue = usePostTemplateValue({
    node: data.node!,
    nodeId: data.id,
    parameterId: name,
  });
  const { handleNodeClass } = useHandleNodeClass(data.id);
  let disabled =
    edges.some(
      (edge) =>
        edge.targetHandle === scapedJSONStringfy(proxy ? { ...id, proxy } : id),
    ) || isToolMode;

  const { handleOnNewValue } = useHandleOnNewValue({
    node: data.node!,
    nodeId: data.id,
    name,
  });

  useFetchDataOnMount(data.node!, handleNodeClass, name, postTemplateValue);

  useEffect(() => {
    if (optionalHandle && optionalHandle.length === 0) {
      optionalHandle = null;
    }
  }, [optionalHandle]);

  const isFlexView = FLEX_VIEW_TYPES.includes(type ?? "");

  // For vertical layout: handles are rendered at node level via NodeInputHandles
  // Don't render handles here - they're handled by NodeInputHandles component
  if (!showNode) {
    return <></>;
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex min-h-10 w-full flex-wrap items-center justify-between px-5 py-2",
        lastInput ? "rounded-b-[0.69rem] pb-5" : "",
        isToolMode && "bg-primary/10",
        (name === "code" && type === "code") || (name.includes("code") && proxy)
          ? "hidden"
          : "",
      )}
    >
      {/* Handles are now rendered at node level for vertical layout */}
      <div
        className={cn(
          "flex w-full flex-col gap-2",
          isFlexView ? "flex-row" : "flex-col",
        )}
      >
        <div className="flex w-full items-center justify-between text-sm">
          <div className="flex w-full items-center truncate">
            {proxy ? (
              <ShadTooltip content={<span>{proxy.id}</span>}>
                {
                  <span>
                    {getCustomParameterTitle({
                      title,
                      nodeId: data.id,
                      isFlexView,
                    })}
                  </span>
                }
              </ShadTooltip>
            ) : (
              <div className="flex gap-2">
                <span>
                  {
                    <span className="text-sm font-medium">
                      {getCustomParameterTitle({
                        title,
                        nodeId: data.id,
                        isFlexView,
                      })}
                    </span>
                  }
                </span>
              </div>
            )}
            <span className={"text-status-red"}>{required ? "*" : ""}</span>
            <div>
              {info !== "" && (
                <ShadTooltip content={<NodeInputInfo info={info} />}>
                  {/* put div to avoid bug that does not display tooltip */}
                  <div className="cursor-help">
                    <IconComponent
                      name="Info"
                      strokeWidth={ICON_STROKE_WIDTH}
                      className="relative bottom-px ml-1 h-3 w-3 text-placeholder"
                    />
                  </div>
                </ShadTooltip>
              )}
            </div>
          </div>
          <CustomParameterLabel
            name={name}
            nodeId={data.id}
            templateValue={data.node?.template[name]}
            nodeClass={data.node!}
          />
        </div>

        {data.node?.template[name] !== undefined && (
          <CustomParameterComponent
            handleOnNewValue={handleOnNewValue}
            name={name}
            nodeId={data.id}
            templateData={data.node?.template[name]!}
            templateValue={data.node?.template[name].value ?? ""}
            editNode={false}
            handleNodeClass={handleNodeClass}
            nodeClass={data.node!}
            disabled={disabled}
            placeholder={
              isToolMode
                ? DEFAULT_TOOLSET_PLACEHOLDER
                : data.node?.template[name].placeholder
            }
            isToolMode={isToolMode}
          />
        )}
      </div>
    </div>
  );
}
