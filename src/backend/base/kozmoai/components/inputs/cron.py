from kozmoai.custom import Component
from kozmoai.io import DropdownInput, MessageTextInput, Output
from kozmoai.schema.message import Message


class CronTriggerComponent(Component):
    """Cron Trigger component for scheduling workflow executions.
    
    This component acts as a trigger input for workflows, similar to Chat Input,
    but designed for scheduled/cron-based executions. It has no upstream connections
    and only provides downstream output via a Message signal.
    """
    
    display_name = "Cron Trigger"
    description = "Trigger workflow execution on a schedule using cron expressions."
    icon = "Clock"
    name = "CronTrigger"
    minimized = True

    inputs = [
        DropdownInput(
            name="schedule_type",
            display_name="Schedule",
            options=["@once", "@hourly", "@daily", "@weekly", "@monthly", "custom"],
            value="@once",
            info="Select a predefined schedule or choose 'custom' for a custom cron expression.",
        ),
        MessageTextInput(
            name="custom_cron",
            display_name="Custom Cron Expression",
            info="Enter a custom cron expression (e.g., '*/15 * * * *' for every 15 minutes). "
                 "Format: minute hour day month weekday",
            value="",
            advanced=True,
        ),
        MessageTextInput(
            name="timezone",
            display_name="Timezone",
            info="Timezone for the schedule (e.g., 'UTC', 'America/New_York').",
            value="UTC",
            advanced=True,
        ),
        MessageTextInput(
            name="trigger_payload",
            display_name="Trigger Payload",
            info="Optional message text to pass when the trigger fires.",
            value="",
            advanced=True,
        ),
    ]
    
    outputs = [
        Output(display_name="Message", name="message", method="fire_trigger"),
    ]

    def get_cron_expression(self) -> str | None:
        """Get the effective cron expression based on schedule type."""
        schedule_map = {
            "@once": None,  # Manual trigger, no cron
            "@hourly": "0 * * * *",
            "@daily": "0 0 * * *",
            "@weekly": "0 0 * * 0",
            "@monthly": "0 0 1 * *",
        }
        
        if self.schedule_type == "custom":
            return self.custom_cron or "* * * * *"
        return schedule_map.get(self.schedule_type)

    def fire_trigger(self) -> Message:
        """Fire the trigger signal to start downstream component execution."""
        from datetime import datetime, timezone
        
        cron_expression = self.get_cron_expression()
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Build the message text
        if self.trigger_payload:
            text = self.trigger_payload
        elif self.schedule_type == "@once":
            text = f"Manual trigger fired at {timestamp}"
        else:
            text = f"Cron trigger ({self.schedule_type}): {cron_expression} at {timestamp}"
        
        # Set status message
        self.status = text
        
        # Return a Message that can be consumed by downstream components
        return Message(
            text=text,
            sender="CronTrigger",
            sender_name="Cron Trigger",
        )
