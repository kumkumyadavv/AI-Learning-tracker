from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.models import LearningSession, Goal, User, Subtask, Roadmap
from app.database import get_db
from app.schemas.sessions import (
    SessionStart,
    SessionStop,
    SessionResponse
)
from app.security import get_current_user

router = APIRouter(prefix="/sessions", tags=["Learning Sessions"])


# START SESSION
@router.post("/start", response_model=SessionResponse)
def start_session(
    data: SessionStart,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(User).filter(
        User.id == current_user.id
    ).with_for_update().first()

    goal = db.query(Goal).filter(
        Goal.id == data.goal_id,
        Goal.owner_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if data.subtask_id is not None:
        subtask = db.query(Subtask).join(Roadmap).filter(
            Subtask.id == data.subtask_id,
            Roadmap.goal_id == data.goal_id
        ).first()

        if not subtask:
            raise HTTPException(
                status_code=400,
                detail="Invalid subtask for this goal"
            )
    active = db.query(LearningSession).filter(
        LearningSession.user_id == current_user.id,
        LearningSession.ended_at.is_(None)
    ).first()

    if active:
        raise HTTPException(status_code=400, detail="A session is already active")
    
    session = LearningSession(
        user_id=current_user.id,
        goal_id=data.goal_id,
        subtask_id=data.subtask_id,
        started_at=datetime.utcnow()
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return session


# STOP SESSION
@router.post("/{session_id}/stop", response_model=SessionResponse)
def stop_session(
    session_id: int,
    data: SessionStop,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(LearningSession).filter(
        LearningSession.id == session_id,
        LearningSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.ended_at is not None:
        raise HTTPException(status_code=400, detail="Session already stopped")

    session.ended_at = datetime.utcnow()
    session.duration_seconds = max(
        0, int((session.ended_at - session.started_at).total_seconds())
    )
    session.notes = data.notes

    db.commit()
    db.refresh(session)

    return session


# SESSION HISTORY
@router.get("/", response_model=list[SessionResponse])
def get_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(LearningSession).filter(
        LearningSession.user_id == current_user.id
    ).order_by(LearningSession.started_at.desc()).all()