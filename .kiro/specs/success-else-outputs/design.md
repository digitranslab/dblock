# Design Document: Success/Else Output Branching

## Overview

This design implements a Success/Else output branching system for workflow components. The system enables fallback chain patterns where execution failures can be gracefully handled by routing to alternative components. Non-terminal components will have Success and Else output paths, while terminal output components (ChatOutput, TextOutput, DataOutput) remain unchanged.

## Architecture

The implementation spans three layers:
1. **Backend Data Model**: Output class with `output_category` field
2. **Backend Execution Engine**: Routing logic based on execution results
3. **Frontend Visualization**: Color-coded handles and visual indicators

```
┌─────────────────────────────────────────────────────────────────┐
│                        Component                                 │
│  ┌─────────────┐                      ┌─────────────────────┐   │
│  │   Inputs    │                      │      Outputs        │   │
│  │  (Gray)     │                      │  ┌───────────────┐  │   │
│  │             │    ┌──────────┐      │  │ Success (Green)│  │   │
│  │  ○ input1   │───▶│ Execute  │─────▶│  │ ○ output      │  │   │
│  │  ○ input2   │    └──────────┘      │  └───────────────┘  │   │
│  │             │         │            │  ┌───────────────┐  │   │
│  │             │         │ (on error) │  │ Else (Red)    │  │   │
│  │             │         └───────────▶│  │ ○ output      │  │   │
│  └─────────────┘                      │  └───────────────┘  │   │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Backend Components

#### 1. Output Class (src/backend/base/kozmoai/template/field/base.py)

```python
class Output(BaseModel):
    # Existing fields...
    output_category: str | None = Field(default=None)
    """Category of the output: 'success', 'else', or None for default behavior.
    Used for visual styling and execution flow routing."""
```

**Status**: ✅ IMPLEMENTED

#### 2. Component Base Class (src/backend/base/kozmoai/custom/custom_component/component.py)

Add method to automatically generate success/else outputs for non-terminal components:

```python
def _generate_success_else_outputs(self) -> list[Output]:
    """Generate success/else output wrappers for non-terminal components.
    
    Returns:
        list[Output]: List containing success and else outputs with same types as original.
    """
    if self._is_terminal_component():
        return self.outputs
    
    wrapped_outputs = []
    for output in self.outputs:
        # Create success output
        success_output = Output(
            name=f"{output.name}_success",
            display_name=f"{output.display_name} (Success)",
            method=output.method,
            types=output.types,
            output_category="success"
        )
        # Create else output
        else_output = Output(
            name=f"{output.name}_else", 
            display_name=f"{output.display_name} (Else)",
            method=f"{output.method}_else",
            types=output.types,
            output_category="else"
        )
        wrapped_outputs.extend([success_output, else_output])
    return wrapped_outputs

def _is_terminal_component(self) -> bool:
    """Check if this component is a terminal output component."""
    from kozmoai.graph.schema import OUTPUT_COMPONENTS
    return self.name in [c.value for c in OUTPUT_COMPONENTS]
```

**Status**: ❌ NOT IMPLEMENTED

#### 3. Graph Execution Engine (src/backend/base/kozmoai/graph/vertex/base.py)

Modify the `_build` method to track execution success/failure and route accordingly:

```python
async def _build(self, ...):
    """Build the vertex and track execution result."""
    try:
        # Existing build logic...
        await self._build_results(...)
        self._execution_success = True
        self._activate_output_path("success")
    except Exception as e:
        self._execution_success = False
        self._execution_error = str(e)
        self._activate_output_path("else")
        # Don't re-raise if else path exists
        if not self._has_else_output():
            raise

def _activate_output_path(self, category: str):
    """Activate outputs matching the given category."""
    for output in self.outputs:
        if output.get("output_category") == category:
            # Mark this output as active for routing
            self._active_outputs.add(output["name"])
        elif output.get("output_category") and output.get("output_category") != category:
            # Deactivate other category outputs
            self._active_outputs.discard(output["name"])
```

**Status**: ❌ NOT IMPLEMENTED

#### 4. Edge Routing (src/backend/base/kozmoai/graph/graph/base.py)

Modify edge traversal to respect active outputs:

```python
def get_next_runnable_vertices(self, vertex: Vertex) -> list[str]:
    """Get vertices that should run next based on active outputs."""
    next_vertices = []
    for edge in vertex.outgoing_edges:
        source_output_name = edge.source_handle.name
        # Only follow edges from active outputs
        if source_output_name in vertex._active_outputs:
            next_vertices.append(edge.target_id)
    return next_vertices
```

**Status**: ❌ NOT IMPLEMENTED

### Frontend Components

#### 1. Input Colors (src/frontend/src/CustomNodes/helpers/get-node-input-colors.ts)

```typescript
const INPUT_GRAY_COLOR = "#9CA3AF"; // Tailwind gray-400

export function getNodeInputColors(...) {
  return [INPUT_GRAY_COLOR];
}
```

**Status**: ✅ IMPLEMENTED

#### 2. Output Colors (src/frontend/src/CustomNodes/helpers/get-node-output-colors.ts)

```typescript
const SUCCESS_COLOR = "#10B981"; // Tailwind green-500
const ELSE_COLOR = "#EF4444"; // Tailwind red-500

export function getNodeOutputColors(output, data, types) {
  if (output.output_category === "success") return [SUCCESS_COLOR];
  if (output.output_category === "else") return [ELSE_COLOR];
  // Fall back to type-based coloring...
}
```

**Status**: ✅ IMPLEMENTED

#### 3. OutputFieldType (src/frontend/src/types/api/index.ts)

```typescript
export type OutputFieldType = {
  // Existing fields...
  output_category?: "success" | "else" | null;
};
```

**Status**: ✅ IMPLEMENTED

#### 4. Visual Indicators (src/frontend/src/CustomNodes/GenericNode/components/NodeOutputParameter/index.tsx)

Add visual badge/label for success/else outputs:

```typescript
// In OutputParameter component
{output.output_category && (
  <Badge 
    variant={output.output_category === "success" ? "success" : "destructive"}
    size="sm"
  >
    {output.output_category === "success" ? "Success" : "Else"}
  </Badge>
)}
```

**Status**: ❌ NOT IMPLEMENTED

## Data Models

### Output Model

```python
class Output(BaseModel):
    types: list[str] = Field(default=[])
    selected: str | None = Field(default=None)
    name: str = Field(description="The name of the field.")
    hidden: bool | None = Field(default=None)
    display_name: str | None = Field(default=None)
    method: str | None = Field(default=None)
    value: Any | None = Field(default=UNDEFINED)
    cache: bool = Field(default=True)
    required_inputs: list[str] | None = Field(default=None)
    allows_loop: bool = Field(default=False)
    tool_mode: bool = Field(default=True)
    output_category: str | None = Field(default=None)  # NEW FIELD
```

### Execution State

```python
class VertexExecutionState:
    success: bool
    error: str | None
    active_outputs: set[str]
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### Property 1: Output Category Coloring
*For any* output with `output_category="success"`, the frontend SHALL render it with green color (#10B981).
*For any* output with `output_category="else"`, the frontend SHALL render it with red color (#EF4444).
**Validates: Requirements 6.1, 6.2**

### Property 2: Input Color Uniformity
*For any* input handle, the frontend SHALL render it with gray color (#9CA3AF) regardless of type.
**Validates: Requirements 5.1, 5.2**

### Property 3: Edge Compatibility Preservation
*For any* edge connection, the validation SHALL check if output types intersect with input types, regardless of visual colors.
**Validates: Requirements 8.1, 8.2**

### Property 4: Terminal Component Exclusion
*For any* component in OUTPUT_COMPONENTS (ChatOutput, TextOutput, DataOutput), the system SHALL NOT add automatic success/else outputs.
**Validates: Requirements 10.2, 10.3, 10.4**

### Property 5: Execution Routing
*For any* component execution that succeeds, data SHALL flow only through outputs with `output_category="success"`.
*For any* component execution that fails, data SHALL flow only through outputs with `output_category="else"`.
**Validates: Requirements 3.1, 3.2, 4.1, 4.2**

### Property 6: Type Inheritance
*For any* success/else output pair, both outputs SHALL have the same types array as the original output.
**Validates: Requirements 2.3, 2.4**

## Error Handling

### Component Execution Errors
- When a component throws an exception during execution:
  1. Check if the component has an "else" output
  2. If yes, route to else output and continue execution
  3. If no, propagate the exception as before

### Edge Connection Errors
- Edge validation remains unchanged
- Type compatibility is enforced regardless of output_category

## Testing Strategy

### Unit Tests
1. Test Output class serialization with output_category field
2. Test color functions return correct colors for each category
3. Test terminal component identification
4. Test edge validation ignores output_category

### Property-Based Tests
1. **Property 1**: Generate random outputs with categories, verify colors
2. **Property 2**: Generate random inputs, verify all return gray
3. **Property 3**: Generate random edges, verify type validation works
4. **Property 4**: Generate terminal components, verify no success/else added
5. **Property 5**: Simulate executions, verify routing correctness

### Integration Tests
1. Build a workflow with success/else branching
2. Trigger success path, verify correct routing
3. Trigger failure path, verify else routing
4. Verify existing workflows without success/else still work

## Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Output.output_category field | ✅ Done | In base.py |
| Frontend OutputFieldType | ✅ Done | In types/api/index.ts |
| Input colors (gray) | ✅ Done | get-node-input-colors.ts |
| Output colors (success/else) | ✅ Done | get-node-output-colors.ts |
| ConditionalRouter update | ✅ Done | Uses output_category |
| DataConditionalRouter update | ✅ Done | Uses output_category |
| Auto success/else generation | ❌ TODO | Component base class |
| Execution result tracking | ❌ TODO | Vertex build |
| Graph routing by category | ❌ TODO | Graph execution |
| Visual indicators (badges) | ❌ TODO | OutputParameter |
| LLMRouter evaluation | ❌ TODO | May need updates |
