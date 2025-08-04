"""
Database configuration and session management for the Doodlr backend.
"""

from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Database URL - using SQLite for simplicity
DATABASE_URL = "sqlite:///./doodlr.db"

# Create engine
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Database models
class CanvasSquare(Base):
    """Database model for canvas squares."""
    __tablename__ = "canvas_squares"
    
    id = Column(Integer, primary_key=True, index=True)
    x = Column(Integer, nullable=False)
    y = Column(Integer, nullable=False)
    level = Column(Integer, nullable=False)  # 1-4 for canvas levels
    color = Column(String, nullable=True)  # Hex color code
    is_zoomable = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UserSession(Base):
    """Database model for user sessions."""
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    user_id = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow)

class UserAction(Base):
    """Database model for user actions."""
    __tablename__ = "user_actions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False)
    action_type = Column(String, nullable=False)  # "zoom" or "paint"
    x = Column(Integer, nullable=False)
    y = Column(Integer, nullable=False)
    level = Column(Integer, nullable=False)
    color = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Create tables
def create_tables():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)

# Dependency to get database session
def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 