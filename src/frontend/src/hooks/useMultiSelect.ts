// Hook for multi-select operations
import { useCallback, useState } from "react";
import { Node, Edge } from "@xyflow/react";

interface MultiSelectState {
  nodes: Node[];
  edges: Edge[];
}

export function useMultiSelect() {
  const [selection, setSelection] = useState<MultiSelectState>({
    nodes: [],
    edges: [],
  });

  const updateSelection = useCallback((nodes: Node[], edges: Edge[]) => {
    setSelection({ nodes, edges });
  }, []);

  const clearSelection = useCallback(() => {
    setSelection({ nodes: [], edges: [] });
  }, []);

  const selectAll = useCallback((nodes: Node[], edges: Edge[]) => {
    setSelection({ nodes, edges });
  }, []);

  const selectNodes = useCallback((nodes: Node[]) => {
    setSelection((prev) => ({ ...prev, nodes }));
  }, []);

  const selectEdges = useCallback((edges: Edge[]) => {
    setSelection((prev) => ({ ...prev, edges }));
  }, []);

  const addToSelection = useCallback((nodes: Node[], edges: Edge[]) => {
    setSelection((prev) => ({
      nodes: [...prev.nodes, ...nodes],
      edges: [...prev.edges, ...edges],
    }));
  }, []);

  const removeFromSelection = useCallback(
    (nodeIds: string[], edgeIds: string[]) => {
      setSelection((prev) => ({
        nodes: prev.nodes.filter((n) => !nodeIds.includes(n.id)),
        edges: prev.edges.filter((e) => !edgeIds.includes(e.id)),
      }));
    },
    []
  );

  const isSelected = useCallback(
    (id: string, type: "node" | "edge") => {
      if (type === "node") {
        return selection.nodes.some((n) => n.id === id);
      }
      return selection.edges.some((e) => e.id === id);
    },
    [selection]
  );

  const selectedCount = selection.nodes.length + selection.edges.length;
  const hasSelection = selectedCount > 0;

  return {
    selection,
    selectedCount,
    hasSelection,
    updateSelection,
    clearSelection,
    selectAll,
    selectNodes,
    selectEdges,
    addToSelection,
    removeFromSelection,
    isSelected,
  };
}
