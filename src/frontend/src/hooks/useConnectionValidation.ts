// Hook for connection validation
import { useCallback, useState } from "react";
import { Connection, Node, Edge } from "@xyflow/react";

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export function useConnectionValidation() {
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [validationPosition, setValidationPosition] = useState({ x: 0, y: 0 });

  const validateConnection = useCallback(
    (
      connection: Connection,
      nodes: Node[],
      edges: Edge[],
      customValidator?: (connection: Connection) => ValidationResult
    ): ValidationResult => {
      // Use custom validator if provided
      if (customValidator) {
        return customValidator(connection);
      }

      // Default validation logic
      const { source, target, sourceHandle, targetHandle } = connection;

      // Check if source and target exist
      if (!source || !target) {
        return {
          isValid: false,
          message: "Invalid connection: missing source or target",
        };
      }

      // Check if connecting to self
      if (source === target) {
        return {
          isValid: false,
          message: "Cannot connect node to itself",
        };
      }

      // Check if connection already exists
      const connectionExists = edges.some(
        (edge) =>
          edge.source === source &&
          edge.target === target &&
          edge.sourceHandle === sourceHandle &&
          edge.targetHandle === targetHandle
      );

      if (connectionExists) {
        return {
          isValid: false,
          message: "Connection already exists",
        };
      }

      // Check for circular dependencies (basic check)
      const wouldCreateCycle = (
        sourceId: string,
        targetId: string,
        edges: Edge[]
      ): boolean => {
        const visited = new Set<string>();
        const stack = [targetId];

        while (stack.length > 0) {
          const current = stack.pop()!;
          if (current === sourceId) return true;
          if (visited.has(current)) continue;
          visited.add(current);

          edges
            .filter((e) => e.source === current)
            .forEach((e) => stack.push(e.target));
        }

        return false;
      };

      if (wouldCreateCycle(source, target, edges)) {
        return {
          isValid: false,
          message: "Would create circular dependency",
        };
      }

      return {
        isValid: true,
        message: "Valid connection",
      };
    },
    []
  );

  const showValidation = useCallback(
    (result: ValidationResult, position: { x: number; y: number }) => {
      setValidationResult(result);
      setValidationPosition(position);
    },
    []
  );

  const hideValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  return {
    validationResult,
    validationPosition,
    validateConnection,
    showValidation,
    hideValidation,
  };
}
