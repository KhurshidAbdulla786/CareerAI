# 🏗️ CareerAI — System Architecture

## Overview

CareerAI is a full-stack AI-powered career assistant built as a monorepo with three independent services communicating over HTTP/REST. The architecture separates concerns cleanly: the **Frontend** handles UI/UX, the **Backend** manages data persistence, auth, and orchestration, and the **AI Service** handles all LLM-powered intelligence.

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Browser (React + Vite)                     │
│                    http://localhost:5173                       │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  Auth    │ │   CV     │ │   Job    │ │    Career    │   │
│  │  Pages   │ │ Analyzer │ │ Matching │ │     Chat     │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │ Skill Gap│ │ Learning │ │Interview │                     │
│  │ Analysis │ │ Roadmap  │ │Simulator │                     │
│  └──────────┘ └──────────┘ └──────────┘                     │
│                                                              │
│  Auth State: React Context + JWT localStorage                │
│  HTTP Client: Axios (with interceptors)                      │
└──────────────────────────┬───────────────────────────────────┘
                           │ REST API (JSON)
                           │ Authorization: Bearer <JWT>
                           ▼
┌──────────────────────────────────────────────────────────────┐
│              Backend — Node.js + Express                      │
│              http://localhost:5001/api                        │
│                                                              │
│  Middleware Stack:                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  Helmet  │ │   CORS   │ │Rate Limit│ │  Morgan Log  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│                                                              │
│  Routes / Controllers:                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  /auth   │ │   /cv    │ │  /jobs   │ │    /chat     │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│  ┌──────────┐ ┌──────────┐                                  │
│  │/interview│ │  /skills │                                  │
│  └──────────┘ └──────────┘                                  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  MongoDB (Mongoose ODM)                                │  │
│  │  Users │ CVs │ Jobs │ ChatHistory                     │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTP (internal service call)
                           ▼
┌──────────────────────────────────────────────────────────────┐
│              AI Service — Python FastAPI                      │
│              http://localhost:8000                            │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  CV      │ │   Job    │ │  Skill   │ │   Career     │   │
│  │ Analysis │ │ Matching │ │   Gap    │ │    Chat      │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│  ┌──────────┐                                               │
│  │Interview │                                               │
│  │ Feedback │                                               │
│  └──────────┘                                               │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           LangChain Orchestration Layer                │  │
│  │  Prompt Templates │ Chains │ Output Parsers            │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           Groq API — Llama 3.3 70B Versatile           │  │
│  │           (Free tier — 30 req/min)                     │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Flow — Key User Journeys

### 1. CV Upload & Analysis
```
User uploads PDF
    → Frontend sends multipart/form-data to POST /api/cv/upload
    → Backend: Multer saves file → pdf-parse extracts text
    → Backend calls AI Service: POST /analyze-cv { cvText }
    → AI Service: LangChain prompt → Groq LLM → structured JSON
    → Backend stores result in MongoDB (CVs collection)
    → Frontend displays: score, strengths, weaknesses, ATS tips
```

### 2. Google OAuth Login
```
User clicks "Sign in with Google"
    → Frontend: Google Identity Services → returns ID token
    → Frontend calls POST /api/auth/google { token }
    → Backend: verifies token with Google → creates/finds user → issues JWT
    → Frontend: stores JWT in localStorage → navigates to /dashboard
```

### 3. Job Matching
```
User pastes job description
    → Frontend: POST /api/jobs/match { jobTitle, jobDescription, cvId }
    → Backend: fetches CV from MongoDB → sends both to AI Service
    → AI Service: compares skills → returns match score + gaps
    → Backend stores result → Frontend displays match % + recommendations
```

### 4. Interview Simulation
```
User starts interview (role + difficulty)
    → POST /api/interview/start → AI generates first question
    → User answers → POST /api/interview/answer
    → AI evaluates answer → gives feedback + next question
    → After N questions → GET /api/interview/feedback/:id → full report
```

### 5. Career Chat (RAG)
```
User sends message
    → POST /api/chat/message { message }
    → Backend retrieves chat history from MongoDB
    → Sends history + new message to AI Service
    → AI Service: LangChain ConversationChain → Groq LLM
    → Returns contextual career advice
    → Backend saves to ChatHistory collection
```

---

## Database Schema (MongoDB)

### `users` collection
```js
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (bcrypt hashed),
  googleId: String (optional),
  isEmailVerified: Boolean,
  emailVerificationToken: String,
  careerGoal: String,
  createdAt: Date,
  updatedAt: Date
}
```

### `cvs` collection
```js
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  fileName: String,
  filePath: String,
  extractedText: String,
  parsedData: {
    name: String,
    education: [Object],
    skills: [String],
    projects: [Object],
    experience: [Object],
    certifications: [String]
  },
  analysisResult: {
    score: Number,
    atsCompatibility: String,
    strengths: [String],
    weaknesses: [String],
    suggestions: [String]
  },
  createdAt: Date
}
```

### `jobs` collection
```js
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  title: String,
  description: String,
  cvId: ObjectId (ref: cvs),
  matchResult: {
    matchScore: Number,
    matchedSkills: [String],
    missingSkills: [String],
    recommendation: String
  },
  createdAt: Date
}
```

### `chathistories` collection
```js
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  messages: [
    {
      role: String, // "user" | "assistant"
      content: String,
      timestamp: Date
    }
  ],
  updatedAt: Date
}
```

---

## Security Architecture

| Layer | Mechanism |
|-------|-----------|
| **Authentication** | JWT (HS256) with configurable expiry |
| **Password storage** | bcryptjs (salt rounds: 10) |
| **Google OAuth** | Google Identity Services (ID token verification) |
| **HTTP Headers** | Helmet.js (XSS, CSRF, clickjacking protection) |
| **CORS** | Whitelist-based (only `FRONTEND_URL` allowed) |
| **Rate Limiting** | express-rate-limit (100 req/15min in production) |
| **Input Validation** | Joi schema validation middleware |
| **File uploads** | Multer with MIME-type filtering (PDF only, max 10MB) |
| **Secrets** | All credentials in `.env` (gitignored) |

---

## Directory Structure

```
CareerAI/
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Root router + protected routes
│   │   ├── main.jsx                   # React entry point
│   │   ├── index.css                  # Tailwind base styles
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx        # Global auth state (JWT + user)
│   │   ├── services/
│   │   │   └── api.js                 # Axios client + all API calls
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── Navbar.jsx
│   │   │       └── Footer.jsx
│   │   └── pages/
│   │       ├── Landing.jsx
│   │       ├── Dashboard.jsx
│   │       ├── auth/
│   │       │   ├── Login.jsx
│   │       │   ├── Register.jsx
│   │       │   └── VerifyEmail.jsx
│   │       ├── cv/CVAnalyzer.jsx
│   │       ├── jobs/JobMatching.jsx
│   │       ├── skills/
│   │       │   ├── SkillGap.jsx
│   │       │   └── LearningRoadmap.jsx
│   │       ├── chat/Chat.jsx
│   │       └── interview/Interview.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.js
│
├── backend/
│   ├── server.js                      # Express app + MongoDB connection
│   ├── config/index.js                # Centralised env config
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── cvRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── skillRoutes.js
│   │   ├── chatRoutes.js
│   │   └── interviewRoutes.js
│   ├── controllers/
│   │   ├── authController.js          # Register, login, Google OAuth, profile
│   │   ├── cvController.js            # Upload, parse, analyze CV
│   │   ├── jobController.js           # Job description matching
│   │   ├── skillController.js         # Skill gap + roadmap generation
│   │   ├── chatController.js          # Career chat + history
│   │   └── interviewController.js     # Mock interview sessions
│   ├── middleware/
│   │   ├── auth.js                    # JWT verification middleware
│   │   ├── upload.js                  # Multer file upload config
│   │   └── validate.js                # Joi request validation
│   ├── models/
│   │   ├── User.js
│   │   ├── CV.js
│   │   ├── Job.js
│   │   └── ChatHistory.js
│   └── services/
│       └── emailService.js            # Nodemailer email sender
│
├── ai-service/
│   └── app/
│       ├── main.py                    # FastAPI app + CORS + routes
│       ├── config.py                  # Pydantic settings
│       ├── llm_service.py             # LangChain + Groq LLM client
│       └── routes/
│           ├── cv_analysis.py         # POST /analyze-cv
│           ├── job_matching.py        # POST /match-job
│           ├── skill_gap.py           # POST /skill-gap, /generate-roadmap
│           ├── career_chat.py         # POST /chat
│           └── interview.py           # POST /interview/start, /answer
│
├── docker-compose.yml                 # Full stack orchestration
├── README.md                          # Project overview + setup guide
├── API.md                             # Full API documentation
└── ARCHITECTURE.md                    # This file
```

---

## Docker Architecture

```
docker-compose.yml
├── mongodb        (mongo:7)           → port 27017
├── backend        (node:18-alpine)    → port 5000
├── ai-service     (python:3.11-slim)  → port 8000
└── frontend       (nginx:alpine)      → port 5173
```

All services communicate on an internal Docker network. Only the ports listed above are exposed to the host machine.

---

## Technology Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| LLM Provider | Groq (Llama 3.3 70B) | Free tier, fast inference (~300 tok/s), strong reasoning |
| LLM Framework | LangChain | Prompt management, chains, output parsing |
| Frontend State | React Context | Lightweight, no Redux overhead for this scale |
| Database | MongoDB | Flexible schema — ideal for AI output (variable JSON) |
| Auth | JWT + Google OAuth | Stateless, scalable, familiar OAuth flow |
| File Upload | Multer | Battle-tested Node.js middleware |
| PDF Parsing | pdf-parse (Node) + pypdf2 (Python) | Dual-layer extraction for reliability |
| Styling | Tailwind CSS | Utility-first, rapid UI development |
| Containerization | Docker + Compose | Simple local + production parity |
