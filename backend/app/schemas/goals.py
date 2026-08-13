from pydantic import BaseModel,ConfigDict,EmailStr
from sqlalchemy import Date
from datetime import datetime,date
from typing import Optional

class GoalCreate(BaseModel):
    title: str
    description: str | None = None
    target_date: date | None = None
    
class GoalResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    target_date: Optional[date]
    status: str
    progress: int
    owner_id: int

    class Config:
        from_attributes = True

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_date: Optional[date] = None
    status: Optional[str] = None
    progress: Optional[int] = None