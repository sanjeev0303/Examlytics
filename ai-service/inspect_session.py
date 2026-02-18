
import os
import json
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.db_models import ExamSession

# Add project root to path
import sys
sys.path.append(os.getcwd())

from dotenv import load_dotenv
load_dotenv()

# DB Setup
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def inspect_session(session_id):
    db = SessionLocal()
    try:
        session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
        if not session:
            print(f"Session {session_id} not found")
            return

        print(f"--- Session {session_id} ---")
        print(f"Status: {session.status}")
        print(f"Score: {session.score}")
        print(f"Questions Count: {len(session.questions)}")

        if session.questions:
            print("\n--- First Question stored ---")
            print(json.dumps(session.questions[0], indent=2))

        if session.user_responses:
            print("\n--- User Responses Stored ---")
            print(json.dumps(session.user_responses, indent=2))
        else:
            print("\n--- No User Responses Stored ---")

    finally:
        db.close()

if __name__ == "__main__":
    inspect_session("592c6738-759e-4d1f-9866-117b02312c6b")
