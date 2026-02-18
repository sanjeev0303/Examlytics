import sys
import os
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.models.models import Topic

def seed_topics():
    db: Session = SessionLocal()
    try:
        topics_to_seed = [
            {"name": "Go", "description": "Go programming language fundamentals and advanced concepts"},
            {"name": "PostgreSQL", "description": "Relational database management system concepts and SQL"},
            {"name": "System Design", "description": "Architecture, scalability, and distributed systems"},
            {"name": "React", "description": "Frontend development with React and modern web technologies"},
            {"name": "Python", "description": "Python programming language for backend and AI/ML"},
        ]

        for topic_data in topics_to_seed:
            existing = db.query(Topic).filter(Topic.name == topic_data["name"]).first()
            if not existing:
                topic = Topic(**topic_data)
                db.add(topic)
                print(f"✅ Added topic: {topic_data['name']}")
            else:
                print(f"🟡 Topic already exists: {topic_data['name']}")

        db.commit()
    except Exception as e:
        print(f"❌ Seeding failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_topics()
