# celeryconfig.py
import os

minerva_redis_host = os.environ.get("MINERVA_REDIS_HOST")
minerva_redis_port = os.environ.get("MINERVA_REDIS_PORT")
# broker default user

if minerva_redis_host and minerva_redis_port:
    broker_url = f"redis://{minerva_redis_host}:{minerva_redis_port}/0"
    result_backend = f"redis://{minerva_redis_host}:{minerva_redis_port}/0"
else:
    # RabbitMQ
    mq_user = os.environ.get("RABBITMQ_DEFAULT_USER", "minerva")
    mq_password = os.environ.get("RABBITMQ_DEFAULT_PASS", "minerva")
    broker_url = os.environ.get("BROKER_URL", f"amqp://{mq_user}:{mq_password}@localhost:5672//")
    result_backend = os.environ.get("RESULT_BACKEND", "redis://localhost:6379/0")
# tasks should be json or pickle
accept_content = ["json", "pickle"]
