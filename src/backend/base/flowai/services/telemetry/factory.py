from __future__ import annotations

from typing import TYPE_CHECKING

from typing_extensions import override

from flowai.services.factory import ServiceFactory
from flowai.services.telemetry.service import TelemetryService

if TYPE_CHECKING:
    from flowai.services.settings.service import SettingsService


class TelemetryServiceFactory(ServiceFactory):
    def __init__(self) -> None:
        super().__init__(TelemetryService)

    @override
    def create(self, settings_service: SettingsService):
        return TelemetryService(settings_service)
