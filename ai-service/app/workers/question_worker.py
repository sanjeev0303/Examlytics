# Celery worker tasks
from celery import Celery

celery_app = Celery('worker', broker='redis://localhost:6379/0')

@celery_app.task
def process_question_generation(topic: str):
    pass
