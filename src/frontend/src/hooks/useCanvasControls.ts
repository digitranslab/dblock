// Hook for canvas control operations
import { useCallback, useState } from "react";
import { useReactFlow } from "@xyflow/react";

export function useCanvasControls() {
  const reactFlowInstance = useReactFlow();
  const [isLocked, setIsLocked] = useState(false);
  const [zoom, setZoom] = useState(1);

  const zoomIn = useCallback(() => {
    reactFlowInstance?.zoomIn({ duration: 300 });
    setZoom(reactFlowInstance?.getZoom() || 1);
  }, [reactFlowInstance]);

  const zoomOut = useCallback(() => {
    reactFlowInstance?.zoomOut({ duration: 300 });
    setZoom(reactFlowInstance?.getZoom() || 1);
  }, [reactFlowInstance]);

  const zoomTo = useCallback(
    (zoomLevel: number) => {
      reactFlowInstance?.zoomTo(zoomLevel, { duration: 300 });
      setZoom(zoomLevel);
    },
    [reactFlowInstance]
  );

  const fitView = useCallback(() => {
    reactFlowInstance?.fitView({ padding: 0.2, duration: 300 });
    setZoom(reactFlowInstance?.getZoom() || 1);
  }, [reactFlowInstance]);

  const toggleLock = useCallback(() => {
    setIsLocked((prev) => !prev);
  }, []);

  const focusNode = useCallback(
    (nodeId: string) => {
      reactFlowInstance?.fitView({
        nodes: [{ id: nodeId }],
        padding: 0.5,
        duration: 300,
      });
    },
    [reactFlowInstance]
  );

  const centerCanvas = useCallback(() => {
    reactFlowInstance?.setCenter(0, 0, { zoom: 1, duration: 300 });
    setZoom(1);
  }, [reactFlowInstance]);

  return {
    zoom,
    isLocked,
    zoomIn,
    zoomOut,
    zoomTo,
    fitView,
    toggleLock,
    focusNode,
    centerCanvas,
  };
}
