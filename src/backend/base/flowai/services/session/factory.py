from typing import TYPE_CHECKING

from typing_extensions import override

from flowai.services.factory import ServiceFactory
from flowai.services.session.service import SessionService

if TYPE_CHECKING:
    from flowai.services.cache.service import CacheService


class SessionServiceFactory(ServiceFactory):
    def __init__(self) -> None:
        super().__init__(SessionService)

    @override
    def create(self, cache_service: "CacheService"):
        return SessionService(cache_service)
