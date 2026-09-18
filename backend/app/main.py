from fastapi import FastAPI,Depends,HTTPException
from . import models
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, get_db
from .routers import goals,users,auth,ai
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-learning-tracker-ruby.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
app.include_router(goals.router)
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(ai.router)
@app.get("/")
def root():
    return {"message": "Welcome to AI Learning Tracker Backend"}