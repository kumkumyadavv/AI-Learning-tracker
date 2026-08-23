 # 🎯 AI Learning Tracker

**AI-powered personalized learning roadmap and progress tracking platform.**

AI Learning Tracker helps users turn their learning goals into structured, personalized roadmaps using **Google Gemini AI**. Users can define their goals, learning preferences, and target dates, then follow AI-generated phases, subtasks, and learning resources while tracking their progress.

## 🚀 Live Demo

**Frontend:**
https://ai-learning-tracker-ruby.vercel.app/

**Backend API:**
https://ai-learning-tracker-dyff.onrender.com

**API Documentation:**
https://ai-learning-tracker-dyff.onrender.com/docs

---

## ✨ Features

### 🔐 Authentication

* User registration and login
* Secure password hashing
* JWT-based authentication
* Protected API routes
* Current-user authentication
* User-specific data access

### 🎯 Learning Goals

* Create personalized learning goals
* Define skill level and learning preferences
* Set daily learning hours
* Set target completion date
* View personal goals
* View individual goal details
* Delete goals

### 🤖 AI-Powered Roadmap Generation

Users provide:

* Learning goal
* Description
* Skill level
* Daily learning hours
* Learning style
* Target date

Google Gemini generates a structured roadmap containing:

* Learning phases
* Subtasks
* Recommended resources
* Resource types
* Resource URLs

### 📚 Roadmap & Progress Tracking

* View roadmap phase by phase
* View subtasks for each phase
* Mark subtasks as completed/uncompleted
* Automatically calculate goal progress
* Track phase-wise completion
* Access recommended learning resources

### 📊 Progress Visualization

* Goal completion percentage
* Completed vs remaining subtasks
* Phase-wise progress
* Visual progress indicators

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
* Passlib / bcrypt
* Alembic

### AI

* Google Gemini API
* Gemini 2.5 Flash

### Deployment

* Vercel — Frontend
* Render — Backend
* PostgreSQL — Database

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
Gemini Generates Personalized Roadmap
       ↓
Roadmap Stored in PostgreSQL
       ↓
Phases → Subtasks → Resources
       ↓
User Completes Subtasks
       ↓
Progress Automatically Recalculated
```

---

## 📁 Project Structure

```text
AI-Learning-tracker/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── goals.py
│   │   │   └── ai.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── goals.py
│   │   │   └── ai.py
│   │   │
│   │   ├── services/
│   │   │   └── ai_service.py
│   │   │
│   │   ├── models.py
│   │   ├── database.py
│   │   ├── security.py
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── .env
│
└── README.md
```

---

# 🚀 Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/Kumkumy99/AI-Learning-tracker.git
cd AI-Learning-tracker
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

Create a `.env` file inside `backend/`:

```env
DATABASE_URL=your_postgresql_database_url
SECRET_KEY=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

Never commit `.env` to GitHub.

Make sure `.env` is included in `.gitignore`.

---

## ▶️ Run Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger documentation:

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

Create `.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Run development server:

```bash
npm run dev
```

Frontend:

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

Protected endpoints require JWT authentication.

---

# 🗄️ Data Model

```text
User
 │
 └── Goals
       │
       └── Roadmap
             │
             └── Phases
                   │
                   └── Subtasks
                         │
                         └── Resources
```

A user can create multiple learning goals.

Each goal can have a generated roadmap containing multiple phases. Each phase contains subtasks, and subtasks can contain recommended learning resources.

---

# 🤖 AI Integration

The application uses **Google Gemini** to generate personalized learning roadmaps.

The AI receives information such as:

```text
Goal
Description
Target Date
Skill Level
Daily Learning Hours
Learning Style
```

Gemini returns a structured roadmap:

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

The backend validates the generated roadmap and stores it in PostgreSQL.

---

# 📈 Progress Tracking

Progress is calculated from subtask completion:

```text
Completed Subtasks
        ÷
Total Subtasks
        ×
100
```

Whenever a user completes or uncompletes a subtask, the backend updates the goal's progress percentage.

This keeps the displayed progress synchronized with the actual roadmap state.

---

# 🔒 Security

The application includes:

* Password hashing
* JWT authentication
* Protected API routes
* User-specific goal access
* Authorization checks
* Environment variables for secrets
* Database-backed user isolation

Sensitive credentials are never stored in the repository.

---

# 🎨 Frontend

The frontend provides:

* Learning-focused dashboard
* Goal management
* AI roadmap visualization
* Phase and subtask organization
* Progress indicators
* Interactive completion tracking
* Learning resource links
* Responsive UI

---

# 🔮 Future Improvements

Planned improvements include:

* 📅 Daily learning activity tracking
* 🔥 GitHub-style learning heatmap
* 🔥 Learning streaks
* 🤖 AI learning assistant / chatbot
* 🧠 Personalized AI feedback
* 📊 Detailed learning analytics
* 🔔 Notifications and reminders
* 📆 Calendar integration
* 📈 Historical progress tracking

---

# 📌 Project Status

## MVP Completed & Deployed 🚀

The MVP currently supports:

* Authentication
* Learning goal management
* AI-powered roadmap generation
* Personalized learning preferences
* Roadmap persistence
* Learning resources
* Subtask completion tracking
* Automatic progress calculation
* PostgreSQL database
* Production deployment

### Deployment

**Frontend:** Vercel
**Backend:** Render
**Database:** PostgreSQL

The current MVP is intentionally focused on the core learning workflow. Additional analytics, heatmaps, streaks, and AI chatbot functionality are planned for future iterations.

---

# 👩‍💻 Author

**Kumkum Yadav**

B.Tech Computer Science & Engineering

GitHub:
https://github.com/Kumkumy99

---

## ⭐ About

AI-powered personal learning tracker built with **FastAPI, PostgreSQL, React, and Google Gemini**, designed to transform learning goals into personalized roadmaps and provide actionable progress tracking.

