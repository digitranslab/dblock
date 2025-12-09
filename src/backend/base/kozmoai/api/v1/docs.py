"""API endpoints for component documentation."""

from fastapi import APIRouter, HTTPException

from kozmoai.components.docs import get_all_docs, get_component_docs, list_documented_components

router = APIRouter(prefix="/docs", tags=["Documentation"])


@router.get("/components")
async def list_components_with_docs():
    """List all components that have documentation."""
    return {"components": list_documented_components()}


@router.get("/components/{component_name}")
async def get_component_documentation(component_name: str):
    """Get documentation for a specific component.
    
    Args:
        component_name: The name of the component (e.g., 'openai_model')
        
    Returns:
        The component documentation as JSON
    """
    docs = get_component_docs(component_name)
    if not docs:
        raise HTTPException(
            status_code=404,
            detail=f"Documentation not found for component: {component_name}"
        )
    return docs


@router.get("/all")
async def get_all_documentation():
    """Get all component documentation.
    
    Returns:
        Dictionary mapping component names to their documentation
    """
    return get_all_docs()
