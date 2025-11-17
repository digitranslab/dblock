from typing import TYPE_CHECKING

from typing_extensions import override

from flowai.services.factory import ServiceFactory
from flowai.services.shared_component_cache.service import SharedComponentCacheService

if TYPE_CHECKING:
    from flowai.services.settings.service import SettingsService


class SharedComponentCacheServiceFactory(ServiceFactory):
    def __init__(self) -> None:
        super().__init__(SharedComponentCacheService)

    @override
    def create(self, settings_service: "SettingsService"):
        return SharedComponentCacheService(expiration_time=settings_service.settings.cache_expire)
