import sys
import os

# Ensure project root is in path
sys.path.append(os.getcwd())

from app.worker.exam_worker import start_worker

if __name__ == "__main__":
    start_worker()
