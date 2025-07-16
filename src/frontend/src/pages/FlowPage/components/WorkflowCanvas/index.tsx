import React, { useCallback, useEffect, useRef, useState } from "react";
import { ReactFlow, Background, BackgroundVariant, Panel, OnSelectionChangeParams, Connection, Edge, OnNodeDrag, SelectionDragHandler } from "@xyflow/react";
import { useHotkeys } from "react-hotkeys-hook";
import { cloneDeep } from "lodash";

// Styles
import "./WorkflowCanvas.scss";

// Components
import MinimalNode from "@/CustomNodes/MinimalNode";
import NoteNode from "@/CustomNodes/NoteNode";
import { DefaultEdge } from "@/CustomEdges";
import ParameterPanel from "@/components/ParameterPanel";
import CanvasControls from "@/components/core/canvasControlsComponent";
import FlowToolbar from "@/components/core/flowToolbarComponent";
import ConnectionLineComponent from "../ConnectionLineComponent";
import SelectionMenu from "../SelectionMenuComponent";

// Hooks and stores
import useFlowStore from "@/stores/flowStore";
import useFlowsManagerStore from "@/stores/flowsManagerStore";
import useAlertStore from "@/stores/alertStore";
import { useShortcutsStore } from "@/stores/shortcuts";
import { useAddComponent } from "@/hooks/useAddComponent";
import useAutoSaveFlow from "@/hooks/flows/use-autosave-flow";
import useUploadFlow from "@/hooks/flows/use-upload-flow";

// Utils and types
import { AllNodeType, EdgeType } from "@/types/flow";
import { APIClassType } from "@/types/api";
import { 
  isValidConnection, 
  validateSelection, 
  generateFlow, 
  generateNodeFromFlow, 
  getNodeId, 
  scapeJSONParse, 
  updateIds 
} from "@/utils/reactflowUtils";
import { isSupportedNodeTypes } from "@/utils/utils";
import { track } from "@/customization/utils/analytics";
import { 
  INVALID_SELECTION_ERROR_ALERT, 
  UPLOAD_ERROR_ALERT, 
  WRONG_FILE_ERROR_ALERT, 
  UPLOAD_ALERT_LIST 
} from "@/constants/alerts_constants";
import { COLOR_OPTIONS, NOTE_NODE_MIN_HEIGHT, NOTE_NODE_MIN_WIDTH } from "@/constants/constants";
import isWrappedWithClass from "../PageComponent/utils/is-wrapped-with-class";
import getRandomName from "../PageComponent/utils/get-random-name";

// Node and edge types
const nodeTypes = {
  genericNode: MinimalNode,
  minimalNode: MinimalNode,
  noteNode: NoteNode,
};

const edgeTypes = {
  default: DefaultEdge,
};

interface WorkflowCanvasProps {
  view?: boolean;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ view }) => {
  // Store hooks
  const reactFlowInstance = useFlowStore((state) => state.reactFlowInstance);
  const setReactFlowInstance = useFlowStore((state) => state.setReactFlowInstance);
  const nodes = useFlowStore((state) => state.nodes || []);
  const edges = useFlowStore((state) => state.edges || []);
  const onNodesChange = useFlowStore((state) => state.onNodesChange);
  const onEdgesChange = useFlowStore((state) => state.onEdgesChange);
  const setNodes = useFlowStore((state) => state.setNodes);
  const setEdges = useFlowStore((state) => state.setEdges);
  const deleteNode = useFlowStore((state) => state.deleteNode);
  const deleteEdge = useFlowStore((state) => state.deleteEdge);
  const onConnect = useFlowStore((state) => state.onConnect);
  const paste = useFlowStore((state) => state.paste);
  const lastCopiedSelection = useFlowStore((state) => state.lastCopiedSelection);
  const setLastCopiedSelection = useFlowStore((state) => state.setLastCopiedSelection);
  const setFilterEdge = useFlowStore((state) => state.setFilterEdge);
  const setPositionDictionary = useFlowStore((state) => state.setPositionDictionary);
  const updateCurrentFlow = useFlowStore((state) => state.updateCurrentFlow);
  
  // Parameter panel state
  const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
  const parameterPanelOpen = useFlowStore((state) => state.parameterPanelOpen);
  const setSelectedNodeId = useFlowStore((state) => state.setSelectedNodeId);
  const setParameterPanelOpen = useFlowStore((state) => state.setParameterPanelOpen);

  // Flow manager store
  const undo = useFlowsManagerStore((state) => state.undo);
  const redo = useFlowsManagerStore((state) => state.redo);
  const takeSnapshot = useFlowsManagerStore((state) => state.takeSnapshot);

  // Alert store
  const setErrorData = useAlertStore((state) => state.setErrorData);

  // Custom hooks
  const autoSaveFlow = useAutoSaveFlow();
  const uploadFlow = useUploadFlow();
  const addComponent = useAddComponent();

  // Local state
  const [selectionMenuVisible, setSelectionMenuVisible] = useState(false);
  const [lastSelection, setLastSelection] = useState<OnSelectionChangeParams | null>(null);
  const [selectionEnded, setSelectionEnded] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Refs
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const edgeUpdateSuccessful = useRef(true);
  const position = useRef({ x: 0, y: 0 });

  // Handle node click for parameter panel
  const onNodeClick = useCallback((event: React.MouseEvent, node: AllNodeType) => {
    if (node.type === "noteNode") return; // Don't open panel for note nodes
    
    setSelectedNodeId(node.id);
    setParameterPanelOpen(true);
  }, [setSelectedNodeId, setParameterPanelOpen]);

  // Handle parameter panel close
  const handleParameterPanelClose = useCallback(() => {
    setParameterPanelOpen(false);
    setSelectedNodeId(null);
  }, [setParameterPanelOpen, setSelectedNodeId]);

  // Handle pane click
  const onPaneClick = useCallback(() => {
    setFilterEdge([]);
    handleParameterPanelClose();
  }, [setFilterEdge, handleParameterPanelClose]);

  // Connection handling
  const onConnectMod = useCallback((params: Connection) => {
    takeSnapshot();
    onConnect(params);
    track("New Component Connection Added");
  }, [takeSnapshot, onConnect]);

  // Node drag handlers
  const onNodeDragStart: OnNodeDrag = useCallback(() => {
    takeSnapshot();
  }, [takeSnapshot]);

  const onNodeDragStop: OnNodeDrag = useCallback(() => {
    autoSaveFlow();
    updateCurrentFlow({ nodes });
    setPositionDictionary({});
  }, [autoSaveFlow, nodes, updateCurrentFlow, setPositionDictionary]);

  // Selection drag handler
  const onSelectionDragStart: SelectionDragHandler = useCallback(() => {
    takeSnapshot();
  }, [takeSnapshot]);

  // Selection handlers
  const onSelectionChange = useCallback((flow: OnSelectionChangeParams): void => {
    setLastSelection(flow);
  }, []);

  const onSelectionStart = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setSelectionEnded(false);
  }, []);

  const onSelectionEnd = useCallback(() => {
    setSelectionEnded(true);
  }, []);

  // Drag and drop handlers
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer.types.some((types) => isSupportedNodeTypes(types))) {
      event.dataTransfer.dropEffect = "move";
    } else {
      event.dataTransfer.dropEffect = "copy";
    }
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const grabbingElement = document.getElementsByClassName("cursor-grabbing");
    if (grabbingElement.length > 0) {
      document.body.removeChild(grabbingElement[0]);
    }
    
    if (event.dataTransfer.types.some((type) => isSupportedNodeTypes(type))) {
      takeSnapshot();
      const datakey = event.dataTransfer.types.find((type) => isSupportedNodeTypes(type));
      const data: { type: string; node?: APIClassType } = JSON.parse(
        event.dataTransfer.getData(datakey!)
      );
      
      addComponent(data.node!, data.type, {
        x: event.clientX,
        y: event.clientY,
      });
    } else if (event.dataTransfer.types.some((types) => types === "Files")) {
      takeSnapshot();
      const position = { x: event.clientX, y: event.clientY };
      uploadFlow({
        files: Array.from(event.dataTransfer.files!),
        position: position,
      }).catch((error) => {
        setErrorData({
          title: UPLOAD_ERROR_ALERT,
          list: [(error as Error).message],
        });
      });
    } else {
      setErrorData({
        title: WRONG_FILE_ERROR_ALERT,
        list: [UPLOAD_ALERT_LIST],
      });
    }
  }, [takeSnapshot, addComponent, uploadFlow, setErrorData]);

  // Keyboard shortcuts
  const shortcuts = useShortcutsStore();

  const handleUndo = useCallback((e: KeyboardEvent) => {
    if (!isWrappedWithClass(e, "noflow")) {
      e.preventDefault();
      (e as unknown as Event).stopImmediatePropagation();
      undo();
    }
  }, [undo]);

  const handleRedo = useCallback((e: KeyboardEvent) => {
    if (!isWrappedWithClass(e, "noflow")) {
      e.preventDefault();
      (e as unknown as Event).stopImmediatePropagation();
      redo();
    }
  }, [redo]);

  const handleCopy = useCallback((e: KeyboardEvent) => {
    const multipleSelection = lastSelection?.nodes ? lastSelection?.nodes.length > 0 : false;
    if (
      !isWrappedWithClass(e, "noflow") &&
      (isWrappedWithClass(e, "react-flow__node") || multipleSelection)
    ) {
      e.preventDefault();
      (e as unknown as Event).stopImmediatePropagation();
      if (window.getSelection()?.toString().length === 0 && lastSelection) {
        setLastCopiedSelection(cloneDeep(lastSelection));
      }
    }
  }, [lastSelection, setLastCopiedSelection]);

  const handlePaste = useCallback((e: KeyboardEvent) => {
    if (!isWrappedWithClass(e, "noflow")) {
      e.preventDefault();
      (e as unknown as Event).stopImmediatePropagation();
      if (window.getSelection()?.toString().length === 0 && lastCopiedSelection) {
        takeSnapshot();
        paste(lastCopiedSelection, {
          x: position.current.x,
          y: position.current.y,
        });
      }
    }
  }, [lastCopiedSelection, takeSnapshot, paste]);

  const handleDelete = useCallback((e: KeyboardEvent) => {
    if (!isWrappedWithClass(e, "nodelete") && lastSelection) {
      e.preventDefault();
      (e as unknown as Event).stopImmediatePropagation();
      takeSnapshot();
      if (lastSelection.edges?.length) {
        track("Component Connection Deleted");
      }
      if (lastSelection.nodes?.length) {
        lastSelection.nodes.forEach((n) => {
          track("Component Deleted", { componentType: n.data.type });
        });
      }
      deleteNode(lastSelection.nodes.map((node) => node.id));
      deleteEdge(lastSelection.edges.map((edge) => edge.id));
    }
  }, [lastSelection, takeSnapshot, deleteNode, deleteEdge]);

  // Register hotkeys
  useHotkeys(shortcuts.undo, handleUndo);
  useHotkeys(shortcuts.redo, handleRedo);
  useHotkeys(shortcuts.redoAlt, handleRedo);
  useHotkeys(shortcuts.copy, handleCopy);
  useHotkeys(shortcuts.paste, handlePaste);
  useHotkeys(shortcuts.delete, handleDelete);
  useHotkeys("delete", handleDelete);

  // Effects
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      position.current = { x: event.clientX, y: event.clientY };
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (selectionEnded && lastSelection && lastSelection.nodes.length > 1) {
      setSelectionMenuVisible(true);
    } else {
      setSelectionMenuVisible(false);
    }
  }, [selectionEnded, lastSelection]);

  useEffect(() => {
    useFlowStore.setState({ autoSaveFlow });
  }, [autoSaveFlow]);

  return (
    <div className="workflow-canvas h-full w-full relative">
      <div ref={reactFlowWrapper} className="h-full w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnectMod}
          onInit={setReactFlowInstance}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          onSelectionDragStart={onSelectionDragStart}
          onSelectionChange={onSelectionChange}
          onSelectionStart={onSelectionStart}
          onSelectionEnd={onSelectionEnd}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionLineComponent={ConnectionLineComponent}
          deleteKeyCode={null}
          multiSelectionKeyCode={null}
          panOnDrag={true}
          panOnScroll={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={false}
          selectNodesOnDrag={false}
          className="workflow-canvas"
          fitView
          fitViewOptions={{
            padding: 0.1,
            includeHiddenNodes: false,
            minZoom: 0.1,
            maxZoom: 2,
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            className="workflow-canvas-background"
          />
        </ReactFlow>
      </div>

      {/* Parameter Panel */}
      {parameterPanelOpen && selectedNodeId && (
        <ParameterPanel
          isOpen={parameterPanelOpen}
          onClose={handleParameterPanelClose}
        />
      )}

      {/* Selection Menu */}
      {selectionMenuVisible && lastSelection && (
        <SelectionMenu
          onClick={() => {}} // TODO: Implement group functionality
          nodes={lastSelection.nodes}
          isVisible={selectionMenuVisible}
          lastSelection={lastSelection}
        />
      )}
    </div>
  );
};

export default WorkflowCanvas; 