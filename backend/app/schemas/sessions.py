from pydantic import BaseModel
from datetime import datetime
from typing import Optional
 
class SessionStart(BaseModel):
    goal_id: int
    subtask_id: Optional[int] = None

class SessionStop(BaseModel):
    notes: Optional[str] = None


class SessionResponse(BaseModel):
    id: int
    goal_id: int
    started_at: datetime
    ended_at: Optional[datetime]
    duration_seconds: int
    notes: Optional[str]
    subtask_id: Optional[int]
    class Config:
        from_attributes = True