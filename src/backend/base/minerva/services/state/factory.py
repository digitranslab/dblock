from typing_extensions import override

from minerva.services.factory import ServiceFactory
from minerva.services.settings.service import SettingsService
from minerva.services.state.service import InMemoryStateService


class StateServiceFactory(ServiceFactory):
    def __init__(self) -> None:
        super().__init__(InMemoryStateService)

    @override
    def create(self, settings_service: SettingsService):
        return InMemoryStateService(
            settings_service,
        )
