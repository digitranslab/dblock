import os

import pytest
from kozmoai.components.langchain_utilities import ToolCallingAgentComponent
from kozmoai.components.models.openai import OpenAIModelComponent
from kozmoai.components.tools.calculator_core import CalculatorComponent


@pytest.mark.api_key_required
async def test_tool_calling_agent_component():
    calculator = CalculatorComponent()  # Use the Calculator component as a tool
    input_value = "What is 2 + 2?"
    chat_history = []
    api_key = os.environ["OPENAI_API_KEY"]
    temperature = 0.1

    # Default OpenAI Model Component
    llm_component = OpenAIModelComponent().set(
        api_key=api_key,
        temperature=temperature,
    )
    llm = llm_component.build_model()

    agent = ToolCallingAgentComponent()
    agent.set(llm=llm, tools=[calculator], chat_history=chat_history, input_value=input_value)

    # Chat output
    response = await agent.message_response()
    assert "4" in response.data.get("text")
