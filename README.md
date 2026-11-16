# AI Learning Tracker

An AI-powered learning planner that helps users turn their learning goals into structured roadmaps, track study sessions, and monitor their learning progress.

**Live Demo:** https://ai-learning-tracker-ruby.vercel.app/  
**Backend API:** https://ai-learning-tracker-dyff.onrender.com/  
**API Documentation:** https://ai-learning-tracker-dyff.onrender.com/docs

---

## Overview

Learning something new requires more than just setting a goal. It requires a clear roadmap, consistent execution, and a way to measure progress.

AI Learning Tracker addresses this by generating personalized learning roadmaps based on a user's goals, current skill level, available study time, learning preferences, and target completion date.

Users can organize their learning into phases and subtasks, track completed activities, record learning sessions, and monitor their overall progress.

## Features

### 1. Authentication & User Management
- User registration and login.
- Password hashing for secure credential storage.
- JWT-based authentication.
- Protected routes and user-specific data.

### 2. AI-Powered Roadmap Generation
- Generate personalized learning roadmaps using Google's Gemini API.
- Customize roadmaps based on:
  - Learning goal and description.
  - Current skill level.
  - Daily available learning hours.
  - Learning preferences.
  - Target completion date.

### 3. Goal Management
- Create and manage learning goals.
- View individual goal details.
- Track goal completion progress.

### 4. Structured Learning Roadmaps
- Organize roadmaps into multiple phases.
- Break phases into manageable subtasks.
- Associate learning resources with subtasks.
- Track individual subtask completion.

### 5. Learning Session Tracking
- Start and stop learning sessions.
- Associate sessions with learning goals and subtasks.
- Record study duration and session details.
- View previous learning sessions.

### 6. Progress Tracking
- Monitor roadmap and goal completion.
- Track completed and pending subtasks.
- View learning activity and session statistics.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, JavaScript, Vite, React Router |
| Styling | CSS |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Data Validation | Pydantic |
| Authentication | JWT, OAuth2 |
| Password Security | Passlib, bcrypt |
| Database Migrations | Alembic |
| AI Integration | Google Gemini API |
| Deployment | Vercel, Render |

---

## System Architecture

The application follows a frontend-backend architecture.

```text
             User
              |
              v
       React Frontend
       (Vite + React)
              |
         HTTP Requests
              |
              v
        FastAPI Backend
              |
       +------+------+
       |             |
       v             v
  PostgreSQL     Gemini API
   Database      Roadmap
                 Generation
```

### Application Flow

1. A user registers or logs into the application.
2. The backend authenticates the user and issues a JWT.
3. The frontend uses the token when accessing protected endpoints.
4. The user creates a learning goal.
5. The backend uses the Gemini API to generate a structured roadmap.
6. The roadmap is stored and managed through the database.
7. Users update subtask completion and record learning sessions.
8. The application retrieves stored data to display learning progress.

---

## Database Design

The application uses PostgreSQL with SQLAlchemy ORM.

Core entities include:

- **User:** Stores user account information.
- **Goal:** Stores individual learning goals.
- **Phase:** Represents stages within a learning roadmap.
- **Subtask:** Represents actionable learning activities within phases.
- **Resource:** Stores learning resources associated with subtasks.
- **LearningSession:** Stores individual study sessions and their details.

The database uses relationships and foreign keys to maintain associations between users, goals, roadmaps, and learning activities.

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js and npm
- PostgreSQL
- Google Gemini API key

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd ai-learning-tracker
```

### 2. Backend Setup

```bash
cd backend

python -m venv .venv
```

Activate the virtual environment:

**Windows**
```bash
.venv\Scripts\activate
```

**macOS/Linux**
```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables in your backend `.env` file, using the variable names expected by your application.

Typical configuration includes:

```env
DATABASE_URL=your_postgresql_connection_string
SECRET_KEY=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

Run database migrations:

```bash
alembic upgrade head
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

Backend documentation:

`http://localhost:8000/docs`

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL provided by Vite.

---

## Project Highlights

- Integrated an external generative AI API into a full-stack application.
- Implemented JWT-based authentication and protected API access.
- Designed relational database models using SQLAlchemy.
- Used Alembic for database schema migrations.
- Built a structured goal-to-roadmap workflow.
- Connected frontend components with REST APIs.
- Implemented learning session tracking and progress calculation.

---

## Future Improvements

- Adaptive roadmaps based on actual learning progress.
- AI-powered learning recommendations.
- Retrieval-Augmented Generation (RAG) for contextual learning assistance.
- Enhanced learning analytics.
- More detailed progress insights.

---
 
[GitHub](https://github.com/kumkumyadavv)

