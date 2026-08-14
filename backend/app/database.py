from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.engine import Engine
from app.config import settings

# In SQLite, connect_args={"check_same_thread": False} is required for FastAPI multithreading
engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

# Enforce foreign key constraints in SQLite
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency for obtaining database sessions per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
