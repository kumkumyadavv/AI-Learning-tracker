from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, DateTime
from .database import Base
from datetime import datetime
from sqlalchemy.orm import relationship
from sqlalchemy import Text


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")
    sessions = relationship("LearningSession", back_populates="user")
    # One User → Many Goals
    goals = relationship("Goal", back_populates="owner")


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    target_date = Column(Date, nullable=True)
    status = Column(String, default="active")
    progress = Column(Integer, default=0)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Many Goals → One User
    owner = relationship("User", back_populates="goals")

    # One Goal → Many Roadmap phases
    roadmaps = relationship("Roadmap", back_populates="goal")


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=False)
    phase_title = Column(String, nullable=False)
    phase_order = Column(Integer, nullable=False)

    # Many Roadmap phases → One Goal
    goal = relationship("Goal", back_populates="roadmaps")

    # One Roadmap phase → Many Subtasks
    subtasks = relationship("Subtask", back_populates="roadmap")


class Subtask(Base):
    __tablename__ = "subtasks"

    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id"), nullable=False)
    title = Column(String, nullable=False)
    completed = Column(Boolean, default=False)

    # Many Subtasks → One Roadmap phase
    roadmap = relationship("Roadmap", back_populates="subtasks")
    sessions = relationship("LearningSession", back_populates="subtask")
    # One Subtask → Many Resources
    resources = relationship("Resource", back_populates="subtask")


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    subtask_id = Column(Integer, ForeignKey("subtasks.id"), nullable=False)
    title = Column(String, nullable=False)
    url = Column(String, nullable=False)
    resource_type = Column(String, nullable=True)

    # Many Resources → One Subtask
    subtask = relationship("Subtask", back_populates="resources")

class LearningSession(Base):
    __tablename__ = "learning_sessions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=False)
    subtask_id = Column(Integer, ForeignKey("subtasks.id"), nullable=True)

    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)

    duration_seconds = Column(Integer, default=0)
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="sessions")
    subtask = relationship("Subtask", back_populates="sessions")