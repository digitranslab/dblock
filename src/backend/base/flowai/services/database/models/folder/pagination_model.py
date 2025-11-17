from fastapi_pagination import Page

from flowai.helpers.base_model import BaseModel
from flowai.services.database.models.flow.model import Flow
from flowai.services.database.models.folder.model import FolderRead


class FolderWithPaginatedFlows(BaseModel):
    folder: FolderRead
    flows: Page[Flow]
