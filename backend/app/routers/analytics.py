from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone, date
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


def get_study_dates(db: Session, user_id: int):
    sessions = db.query(
        LearningSession.started_at
    ).filter(
        LearningSession.user_id == user_id
    ).all()

    ist = timezone(timedelta(hours=5, minutes=30))

    study_dates = {
        session.started_at.replace(
            tzinfo=timezone.utc
        ).astimezone(ist).date()
        for session in sessions
    }

    return study_dates

@router.get("/streaks")
def get_streaks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    study_dates = get_study_dates(db, current_user.id)

    today = datetime.now(
        timezone(timedelta(hours=5, minutes=30))
    ).date()

    current_streak = 0
    check_date = today

    if check_date not in study_dates:
        check_date -= timedelta(days=1)

    while check_date in study_dates:
        current_streak += 1
        check_date -= timedelta(days=1)

    longest_streak = 0
    streak = 0
    previous_date = None

    for study_date in sorted(study_dates):
        if previous_date and study_date == previous_date + timedelta(days=1):
            streak += 1
        else:
            streak = 1

        longest_streak = max(longest_streak, streak)
        previous_date = study_date

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "total_active_days": len(study_dates)
    }


@router.get("/calendar")
def learning_calendar(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sessions = db.query(
        LearningSession.started_at,
        LearningSession.ended_at,
        LearningSession.duration_seconds
    ).filter(
        LearningSession.user_id == current_user.id
    ).all()

    ist = timezone(timedelta(hours=5, minutes=30))

    daily_activity = {}

    for session in sessions:
        study_date = session.started_at.replace(
            tzinfo=timezone.utc
        ).astimezone(ist).date()

        duration = session.duration_seconds or 0

        if session.ended_at is None:
            duration = max(
                0,
                int((datetime.utcnow() - session.started_at).total_seconds())
            )

        daily_activity[study_date] = (
            daily_activity.get(study_date, 0) + duration
        )

    return [
        {
            "date": str(day),
            "study_seconds": seconds,
            "study_hours": round(seconds / 3600, 2)
        }
        for day, seconds in sorted(daily_activity.items())
    ]



@router.get("/goals")
def goal_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goals = db.query(Goal).filter(
        Goal.owner_id == current_user.id
    ).all()

    result = []

    for goal in goals:
        sessions = db.query(
            func.sum(LearningSession.duration_seconds),
            func.count(LearningSession.id)
        ).filter(
            LearningSession.goal_id == goal.id,
            LearningSession.user_id == current_user.id,
            LearningSession.ended_at.isnot(None)
        ).first()

        completed = db.query(func.count(Subtask.id)).join(
            Roadmap, Subtask.roadmap_id == Roadmap.id
        ).filter(
            Roadmap.goal_id == goal.id,
            Subtask.completed.is_(True)
        ).scalar()

        pending = db.query(func.count(Subtask.id)).join(
            Roadmap, Subtask.roadmap_id == Roadmap.id
        ).filter(
            Roadmap.goal_id == goal.id,
            Subtask.completed.is_(False)
        ).scalar()

        total_seconds = sessions[0] or 0

        result.append({
            "goal_id": goal.id,
            "goal_title": goal.title,
            "total_study_seconds": total_seconds,
            "total_study_hours": round(total_seconds / 3600, 2),
            "total_sessions": sessions[1] or 0,
            "completed_subtasks": completed or 0,
            "pending_subtasks": pending or 0
        })

    return result