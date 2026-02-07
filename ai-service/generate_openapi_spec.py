import json
from app.main import app

with open("openapi_ai.json", "w") as f:
    json.dump(app.openapi(), f, indent=2)
print("OpenAPI spec generated in openapi_ai.json")
