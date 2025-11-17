from fastapi_pagination import Page

from minerva.helpers.base_model import BaseModel
from minerva.services.database.models.flow.model import Flow
from minerva.services.database.models.folder.model import FolderRead


class FolderWithPaginatedFlows(BaseModel):
    folder: FolderRead
    flows: Page[Flow]
