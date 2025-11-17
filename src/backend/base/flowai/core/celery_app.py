from celery import Celery


def make_celery(app_name: str, config: str) -> Celery:
    celery_app = Celery(app_name)
    celery_app.config_from_object(config)
    celery_app.conf.task_routes = {"flowai.worker.tasks.*": {"queue": "flowai"}}
    return celery_app


celery_app = make_celery("flowai", "flowai.core.celeryconfig")
