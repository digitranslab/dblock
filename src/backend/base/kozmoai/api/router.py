# Router for base api
from fastapi import APIRouter

from kozmoai.api.v1 import (
    api_key_router,
    chat_router,
    docs_router,
    endpoints_router,
    files_router,
    flow_runs_router,
    flows_router,
    folders_router,
    login_router,
    monitor_router,
    secrets_router,
    starter_projects_router,
    store_router,
    users_router,
    validate_router,
    variables_router,
)
from kozmoai.api.v2 import files_router as files_router_v2

router = APIRouter(
    prefix="/api/v1",
)

router_v2 = APIRouter(
    prefix="/api/v2",
)

router.include_router(chat_router)
router.include_router(docs_router)
router.include_router(endpoints_router)
router.include_router(validate_router)
router.include_router(store_router)
router.include_router(flows_router)
router.include_router(flow_runs_router)
router.include_router(users_router)
router.include_router(api_key_router)
router.include_router(login_router)
router.include_router(variables_router)
router.include_router(files_router)
router.include_router(monitor_router)
router.include_router(folders_router)
router.include_router(starter_projects_router)
router.include_router(secrets_router)

router_v2.include_router(files_router_v2)
