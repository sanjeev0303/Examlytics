
import sys
import os

# Add project root to path
sys.path.append(os.getcwd())

from dotenv import load_dotenv
load_dotenv()

print("Attempting to import start_worker...")
try:
    from app.worker.exam_worker import start_worker
    print("Import successful.")
except Exception as e:
    print(f"Import Failed: {e}")
    sys.exit(1)

print("Attempting to run start_worker (dry run)...")
# We can't easily mock the infinite loop, but we can check if it starts listening
# or crashes immediately.
# Actually, calling start_worker() will block.
# Let's inspect the code or just run it and kill it after a few secs.

import threading
import time

t = threading.Thread(target=start_worker, daemon=True)
t.start()

print("Worker thread started. Waiting 5s...")
time.sleep(5)
print("Worker thread still alive?", t.is_alive())

if not t.is_alive():
    print("Worker died!")
else:
    print("Worker is running.")
