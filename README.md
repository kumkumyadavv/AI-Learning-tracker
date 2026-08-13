# 🎯 AI Learning Tracker

An AI-powered learning tracker that converts a user's learning goal into a structured, personalized roadmap with phases, subtasks, learning resources, and progress tracking.

Users can create learning goals, provide their learning preferences, generate an AI-powered roadmap using Gemini, and track their progress by completing individual subtasks.

---

## ✨ Features

### 🔐 Authentication

* User registration
* Secure password hashing
* JWT-based authentication
* Login and logout
* Protected routes
* Current-user authentication

### 🎯 Goal Management

* Create learning goals
* View personal goals
* View individual goal details
* Delete goals
* Track goal completion percentage

### 🤖 AI Roadmap Generation

Users provide:

* Learning goal
* Skill level
* Daily learning hours
* Learning style
* Target date

Gemini generates a structured learning roadmap containing:

* Multiple learning phases
* Subtasks for each phase
* Recommended learning resources
* Resource types
* Resource URLs

### 📚 Roadmap & Progress Tracking

* View roadmap phase by phase
* View subtasks under each phase
* Mark subtasks as completed/uncompleted
* Progress automatically updates based on completed subtasks
* Phase-wise completion status
* Goal-level progress percentage
* Learning resources with external links

### 📊 Progress Visualization

* Goal progress visualization
* Completed vs remaining subtasks
* Phase-wise progress visualization
* Goal comparison based on completion percentage

---

## 🛠️ Tech Stack

### Frontend

* React
* JavaScript
* Vite
* React Router
* CSS

### Backend

* FastAPI
* Python
* SQLAlchemy
* PostgreSQL
* Pydantic
* JWT Authentication
* Password Hashing

### AI

* Google Gemini API
* Gemini 2.5 Flash

---

## 🏗️ Architecture

```text
                    ┌────────────────────┐
                    │      React UI      │
                    │     Frontend       │
                    └─────────┬──────────┘
                              │
                              │ REST API
                              ▼
                    ┌────────────────────┐
                    │      FastAPI       │
                    │      Backend       │
                    └─────────┬──────────┘
                              │
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
        ┌─────────────────┐       ┌─────────────────┐
        │   PostgreSQL    │       │   Gemini API    │
        │    Database     │       │  AI Generation  │
        └─────────────────┘       └─────────────────┘
```

---

## 🔄 Application Flow

```text
Register / Login
       ↓
Create Learning Goal
       ↓
Provide Learning Preferences
       ↓
Gemini Generates Roadmap
       ↓
Roadmap is Stored in Database
       ↓
Phases → Subtasks → Resources
       ↓
User Completes Subtasks
       ↓
Progress is Automatically Calculated
```

---

## 📁 Backend Structure

```text
backend/
│
├── app/
│   ├── routers/
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── goals.py
│   │   └── ai.py
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── goals.py
│   │   └── ai.py
│   │
│   ├── services/
│   │   └── ai_service.py
│   │
│   ├── models.py
│   ├── database.py
│   ├── security.py
│   └── main.py
│
└── requirements.txt
```

---

## 📁 Frontend Structure

```text
frontend/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── context/
│   ├── App.jsx
│   └── main.jsx
│
├── public/
├── .env
└── package.json
```

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <PROJECT_FOLDER>
```

---

# ⚙️ Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### macOS/Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## 🔑 Backend Environment Variables

Create a `.env` file inside the backend directory:

```env
DATABASE_URL=your_postgresql_database_url
SECRET_KEY=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

Never commit `.env` to GitHub.

Make sure `.env` is included in `.gitignore`.

---

## ▶️ Run Backend

From the backend directory:

```bash
uvicorn app.main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

---

# 💻 Frontend Setup

Open a new terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Run the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# 🔌 API Overview

### Authentication

```text
POST /auth/register
POST /auth/login
```

### Users

```text
GET /users/me
```

### Goals

```text
POST /goals
GET /goals
GET /goals/{goal_id}
DELETE /goals/{goal_id}
```

### AI Roadmap

```text
POST /ai/goals/{goal_id}/generate-roadmap
GET /ai/goals/{goal_id}/roadmap
PATCH /ai/subtasks/{subtask_id}
```

All protected endpoints require JWT authentication.

---

# 🗄️ Data Model

The application uses relational database relationships between:

```text
User
 │
 └── Goals
       │
       └── Roadmap
             │
             └── Subtasks
                    │
                    └── Resources
```

A user owns their goals.

A goal can have a generated roadmap.

A roadmap contains multiple phases.

Each phase contains subtasks.

Each subtask can contain learning resources.

---

# 🤖 AI Integration

The application uses Google's Gemini API to generate personalized learning roadmaps.

The AI receives information such as:

```text
Goal
Description
Target Date
Skill Level
Daily Learning Hours
Learning Style
```

It then returns a structured JSON roadmap:

```json
{
  "phases": [
    {
      "phase_title": "Phase 1",
      "subtasks": [
        {
          "title": "Learn the fundamentals",
          "resources": [
            {
              "title": "Learning Resource",
              "url": "https://example.com",
              "resource_type": "article"
            }
          ]
        }
      ]
    }
  ]
}
```

The backend validates and stores the generated roadmap in the database.

---

# 📈 Progress Tracking

Progress is calculated from subtask completion.

```text
Completed Subtasks
        ÷
Total Subtasks
        ×
100
```

When a user checks or unchecks a subtask, the backend recalculates the goal's progress percentage.

This means the displayed progress always reflects the actual roadmap completion state.

---

# 🔒 Security

The application includes:

* Password hashing
* JWT authentication
* Protected API routes
* User-specific goal access
* Authorization checks for roadmap/subtask updates
* Environment variables for secrets

Sensitive credentials should never be committed to the repository.

---

# 🎨 Frontend Design

The frontend focuses on:

* Clean learning-focused UI
* Responsive layouts
* Goal-based dashboard
* Roadmap visualization
* Progress indicators
* Interactive subtasks
* Clear resource organization

The application is designed to prioritize usability rather than excessive visual effects.

---

# 🔮 Future Improvements

Possible future enhancements include:

* Daily learning history
* Study streaks
* Progress history
* Personalized AI feedback
* AI-powered roadmap regeneration
* Notifications and reminders
* Calendar integration
* More detailed learning analytics
* Deployment monitoring

---

# 👩‍💻 Author

**Kumkum Yadav**

B.Tech Computer Science & Engineering

---

## ⭐ Project Status

**MVP Completed**

The application currently supports authentication, goal management, AI-powered roadmap generation, roadmap persistence, resource recommendations, and subtask-based progress tracking.

Deployment and production configuration are the next steps.
