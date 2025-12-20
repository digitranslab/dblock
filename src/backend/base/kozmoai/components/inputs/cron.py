from kozmoai.custom import Component
from kozmoai.io import DropdownInput, MessageTextInput, Output
from kozmoai.schema import Trigger


class CronTriggerComponent(Component):
    """Cron Trigger component for scheduling workflow executions.
    
    This component acts as a trigger input for workflows, similar to Chat Input,
    but designed for scheduled/cron-based executions. It has no upstream connections
    and only provides downstream output via a Trigger signal.
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
            info="Optional JSON payload to pass when the trigger fires.",
            value="{}",
            advanced=True,
        ),
    ]
    
    outputs = [
        Output(display_name="Trigger", name="trigger", method="fire_trigger"),
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

    def fire_trigger(self) -> Trigger:
        """Fire the trigger signal to start downstream component execution."""
        import json
        
        cron_expression = self.get_cron_expression()
        
        # Parse the trigger payload
        try:
            payload = json.loads(self.trigger_payload or "{}")
        except json.JSONDecodeError:
            payload = {"raw": self.trigger_payload}
        
        # Create the trigger using the factory method
        trigger = Trigger.from_cron(
            schedule_type=self.schedule_type,
            cron_expression=cron_expression,
            timezone_str=self.timezone,
            payload=payload,
        )
        
        # Set status message
        if self.schedule_type == "@once":
            self.status = f"Manual trigger fired at {trigger.timestamp}"
        else:
            self.status = f"Cron trigger ({self.schedule_type}): {cron_expression}"
        
        return trigger
