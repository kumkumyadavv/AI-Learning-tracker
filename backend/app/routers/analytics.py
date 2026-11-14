from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone

from app.database import get_db
from app.models import LearningSession, Goal, Roadmap, Subtask, User
from app.security import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

def get_today_range():
    ist = timezone(timedelta(hours=5, minutes=30))

    now = datetime.now(ist)

    start = now.replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0
    )

    end = start + timedelta(days=1)

    start_utc = start.astimezone(timezone.utc).replace(tzinfo=None)
    end_utc = end.astimezone(timezone.utc).replace(tzinfo=None)

    return start_utc, end_utc


@router.get("/daily")
def daily_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    start, end = get_today_range()
    total_seconds = db.query(
        func.sum(LearningSession.duration_seconds)
    ).filter(
        LearningSession.user_id == current_user.id,
        LearningSession.started_at >= start,
        LearningSession.started_at < end,
        LearningSession.ended_at.isnot(None)
    ).scalar()
    completed_sessions = db.query(
    func.count(LearningSession.id)
).filter(
    LearningSession.user_id == current_user.id,
    LearningSession.started_at >= start,
    LearningSession.started_at < end,
    LearningSession.ended_at.isnot(None)
).scalar()
    active_session = db.query(LearningSession).filter(
    LearningSession.user_id == current_user.id,
    LearningSession.ended_at.is_(None)
).first()
    completed_subtasks = db.query(
    func.count(Subtask.id)
).join(
    Roadmap, Subtask.roadmap_id == Roadmap.id
).join(
    Goal, Roadmap.goal_id == Goal.id
).filter(
    Goal.owner_id == current_user.id,
    Subtask.completed.is_(True)
).scalar()
    pending_subtasks = db.query(
    func.count(Subtask.id)
).join(
    Roadmap, Subtask.roadmap_id == Roadmap.id
).join(
    Goal, Roadmap.goal_id == Goal.id
).filter(
    Goal.owner_id == current_user.id,
    Subtask.completed.is_(False)
).scalar()
    return {
    "total_study_seconds": total_seconds or 0,
    "total_study_hours": round((total_seconds or 0) / 3600, 2),
    "completed_sessions": completed_sessions or 0,
    "active_session": {
        "id": active_session.id,
        "goal_id": active_session.goal_id,
        "started_at": active_session.started_at
    } if active_session else None,
    "completed_subtasks": completed_subtasks or 0,
    "pending_subtasks": pending_subtasks or 0
}