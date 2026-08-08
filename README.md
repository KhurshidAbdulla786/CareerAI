# CareerAI — AI Career Mentor & CV Analyzer

An AI-powered career assistant that helps fresh graduates analyze their CV, understand their skills, match with jobs, identify skill gaps, create learning roadmaps, and prepare for interviews.

**Status:** Active development — authentication complete, AI features in progress.

## Vision

CareerAI is a full-stack platform leveraging Large Language Models (LLMs) to provide intelligent career guidance. The application is structured as a monorepo with three services:

- **Backend** — Node.js + Express API server (data persistence, auth, orchestration)
- **Frontend** — React + Vite UI (user-facing interface)
- **AI Service** — Python FastAPI server (LLM-powered analysis via LangChain)

## Features

### ✅ Implemented
- **User Authentication** — JWT-based register/login, email verification, protected routes
- **Profile Management** — user profile retrieval & updates
- **Protected Routing** — frontend route guards redirect unauthenticated users to login
- **CV Upload & AI-Powered Analysis** — PDF upload, text extraction, AI analysis (score, strengths, weaknesses, ATS compatibility, suggestions)
- **PDF Parsing** — PDF text extraction via `pdf-parse` (Node.js) & `pypdf2` (Python AI service)

### 🚧 In Progress / Planned
- Job Description Matching with Skill Comparison
- Skill Gap Analysis & Learning Roadmaps
- AI Career Chat Assistant (RAG-based)
- Interview Simulation with AI Feedback

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express, MongoDB |
| AI Service | Python, FastAPI, LangChain |
| LLM | Groq (Llama 3.3 70B) — free tier |

## Development Progress

| Day | Milestone | Status |
|-----|-----------|--------|
| 1 | Project initialization & monorepo scaffolding | ✅ |
| 2 | Backend setup — Express server, MongoDB models (User, Job, ChatHistory) | ✅ |
| 3 | Authentication — JWT auth, email verification, protected routes | ✅ |
| 4 | CV Analyzer — upload & AI-powered analysis | ✅ |
| 4b | PDF Parsing — pdf-parse (Node) & pypdf2 (Python) | ✅ |
| 5 | Job Matching — skill comparison & gap analysis | 🔄 |
| 6 | Skill Gap Analysis & Learning Roadmaps | ⬜ |
| 7 | AI Career Chat Assistant (RAG-based) | ⬜ |
| 8 | Interview Simulation with AI Feedback | ⬜ |
| 9 | Frontend polish, testing & deployment | ⬜ |
| 10 | Final review & documentation | ⬜ |