# celeryconfig.py
import os

flowai_redis_host = os.environ.get("FLOWAI_REDIS_HOST")
flowai_redis_port = os.environ.get("FLOWAI_REDIS_PORT")
# broker default user

if flowai_redis_host and flowai_redis_port:
    broker_url = f"redis://{flowai_redis_host}:{flowai_redis_port}/0"
    result_backend = f"redis://{flowai_redis_host}:{flowai_redis_port}/0"
else:
    # RabbitMQ
    mq_user = os.environ.get("RABBITMQ_DEFAULT_USER", "flowai")
    mq_password = os.environ.get("RABBITMQ_DEFAULT_PASS", "flowai")
    broker_url = os.environ.get("BROKER_URL", f"amqp://{mq_user}:{mq_password}@localhost:5672//")
    result_backend = os.environ.get("RESULT_BACKEND", "redis://localhost:6379/0")
# tasks should be json or pickle
accept_content = ["json", "pickle"]
