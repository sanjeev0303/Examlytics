.PHONY: dev install build

# Run the development server
dev:
	./venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# Install dependencies
install:
	./venv/bin/pip install -r requirements.txt

# Run database/setup scripts (example)
setup:
	./venv/bin/python scripts/ingest_dataset.py
