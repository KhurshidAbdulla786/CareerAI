# 🚀 CareerAI — AI Career Mentor & CV Analyzer

> An AI-powered career assistant that helps fresh graduates analyze their CV, match with jobs, identify skill gaps, build personalized learning roadmaps, and prepare for interviews — all powered by Groq's Llama 3.3 70B.

[![Status](https://img.shields.io/badge/Status-Complete-brightgreen)](https://github.com/KhurshidAbdulla786/CareerAI)
[![Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20FastAPI-blue)](https://github.com/KhurshidAbdulla786/CareerAI)
[![LLM](https://img.shields.io/badge/LLM-Groq%20Llama%203.3%2070B-orange)](https://groq.com)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Docker Deployment](#-docker-deployment)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | JWT-based register/login, Google OAuth, email verification |
| 📄 **CV Analysis** | Upload PDF → AI extracts & scores your CV (ATS score, strengths, weaknesses, suggestions) |
| 💼 **Job Matching** | Paste a job description → AI compares your skills and gives a match % |
| 🧠 **Skill Gap Analysis** | Identifies missing skills between your profile and target role |
| 🗺️ **Learning Roadmap** | Generates a step-by-step personalized learning plan |
| 💬 **Career Chat** | Interactive AI mentor — ask anything about your career |
| 🎤 **Interview Simulator** | Practice mock interviews with real-time AI feedback |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6 |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose |
| **AI Service** | Python, FastAPI, LangChain, ChromaDB |
| **LLM** | Groq API — Llama 3.3 70B Versatile (free tier) |
| **Auth** | JWT + Google OAuth 2.0 |
| **DevOps** | Docker, Docker Compose, Nginx |

---

## 📁 Project Structure

```
CareerAI/
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── pages/          # Route-level components
│   │   │   ├── auth/       # Login, Register, VerifyEmail
│   │   │   ├── cv/         # CV Analyzer
│   │   │   ├── jobs/       # Job Matching
│   │   │   ├── skills/     # Skill Gap + Learning Roadmap
│   │   │   ├── interview/  # Interview Simulator
│   │   │   ├── chat/       # Career Chat
│   │   │   └── Dashboard.jsx
│   │   ├── components/     # Reusable UI components
│   │   │   └── layout/     # Navbar, Footer
│   │   ├── contexts/       # AuthContext (global auth state)
│   │   └── services/       # Axios API client
│   ├── Dockerfile
│   └── nginx.conf
│
├── backend/                # Node.js + Express API
│   ├── controllers/        # Route handlers
│   ├── routes/             # Express routers
│   ├── models/             # Mongoose schemas (User, CV, Job, ChatHistory)
│   ├── middleware/         # Auth, upload, validation
│   ├── services/           # Email service
│   ├── config/             # App configuration
│   └── server.js
│
├── ai-service/             # Python FastAPI AI engine
│   └── app/
│       ├── routes/         # CV analysis, job matching, skill gap, chat, interview
│       ├── llm_service.py  # Groq/LangChain LLM integration
│       ├── config.py       # AI service configuration
│       └── main.py         # FastAPI app entry point
│
├── docker-compose.yml      # Full-stack Docker orchestration
├── ARCHITECTURE.md         # Detailed system architecture
└── API.md                  # Full API documentation
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)
- [Groq API key](https://console.groq.com) (free)

### 1. Clone the repo

```bash
git clone https://github.com/KhurshidAbdulla786/CareerAI.git
cd CareerAI
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values (MongoDB URI, JWT secret, Google OAuth, Groq key)
npm run dev
```

### 3. AI Service setup

```bash
cd ai-service
pip install -r requirements.txt
cp .env.example .env   # add your GROQ_API_KEY
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** 🎉

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/career-ai
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d
AI_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE=10485760

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=CareerAI <no-reply@careerai.app>
```

### AI Service (`ai-service/.env`)

```env
GROQ_API_KEY=gsk_your_groq_api_key
LLM_PROVIDER=groq
GROQ_MODEL=llama-3.3-70b-versatile
USE_MOCK_LLM=false
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5001/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## 📡 API Reference

See [API.md](./API.md) for full endpoint documentation.

**Base URL:** `http://localhost:5001/api`

| Route | Method | Description | Auth |
|-------|--------|-------------|------|
| `/auth/register` | POST | Register new user | ❌ |
| `/auth/login` | POST | Login with email/password | ❌ |
| `/auth/google` | POST | Google OAuth login | ❌ |
| `/auth/verify-email` | GET | Verify email token | ❌ |
| `/auth/profile` | GET | Get current user | ✅ |
| `/auth/profile` | PUT | Update profile | ✅ |
| `/cv/upload` | POST | Upload & analyze CV | ✅ |
| `/cv/user/all` | GET | Get all user CVs | ✅ |
| `/cv/:id` | GET | Get CV by ID | ✅ |
| `/jobs/match` | POST | Match job description | ✅ |
| `/jobs/history` | GET | Job match history | ✅ |
| `/skills/analyze-gap` | POST | Analyze skill gaps | ✅ |
| `/skills/generate-roadmap` | POST | Generate learning roadmap | ✅ |
| `/chat/message` | POST | Send chat message | ✅ |
| `/chat/history` | GET | Get chat history | ✅ |
| `/interview/start` | POST | Start interview session | ✅ |
| `/interview/answer` | POST | Submit answer | ✅ |
| `/interview/feedback/:id` | GET | Get session feedback | ✅ |

---

## 🐳 Docker Deployment

Run the entire stack with one command:

```bash
# Set your Groq API key
export GROQ_API_KEY=gsk_your_key_here

docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| AI Service | http://localhost:8000 |
| MongoDB | localhost:27017 |

---

## 🔒 Security Notes

- Never commit `.env` files — they are gitignored
- Rotate your Google OAuth credentials if they were ever exposed
- Use strong `JWT_SECRET` values in production
- Change `MONGO_INITDB_ROOT_PASSWORD` in `docker-compose.yml` before deploying

---

## 👨💻 Author

**Khurshid Abdulla** — Built as a 10-day AI engineering challenge.

> *"Built to help fresh graduates land their dream job with the power of AI."*
