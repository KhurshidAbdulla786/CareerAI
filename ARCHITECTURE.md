# CareerAI — System Architecture

## Overview
CareerAI is a full-stack AI-powered career assistant application that helps fresh graduates analyze CVs, match with jobs, identify skill gaps, create learning roadmaps, and prepare for interviews.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Auth    │ │   CV     │ │   Job    │ │   Chat   │  │
│  │  Pages   │ │  Analyzer│ │  Matching│ │   Bot    │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │ Learning │ │Interview │ │  Skill   │               │
│  │ Roadmap  │ │ Simulator│ │  Gap     │               │
│  └──────────┘ └──────────┘ └──────────┘               │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP/REST (Axios)
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Backend (Node.js + Express)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Auth    │ │   CV     │ │   Job    │ │   Chat   │  │
│  │  Routes  │ │  Routes  │ │  Routes  │ │  Routes  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │Interview │ │Middleware│ │  Models  │               │
│  │ Routes   │ │ (Auth)   │ │ (MongoDB)│               │
│  └──────────┘ └──────────┘ └──────────┘               │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP/REST
                      ▼
┌─────────────────────────────────────────────────────────┐
│             AI Service (Python FastAPI)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  CV      │ │   Job    │ │ Learning │ │  Career  │  │
│  │ Analysis │ │ Matching │ │ Roadmap  │ │   Chat   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │Interview │ │ Sentence │ │ ChromaDB │               │
│  │ Feedback │ │Transform.│ │ (Vector) │               │
│  └──────────┘ └──────────┘ └──────────┘               │
│  ┌──────────────────────────────────────────────────┐  │
│  │           LangChain Orchestration                 │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

1. User uploads CV PDF → Backend stores file → Extracts text → Sends to AI Service
2. AI Service processes CV → Returns structured analysis → Stored in MongoDB
3. User pastes job description → Backend sends to AI Service → Returns match analysis
4. User asks career questions → Backend → AI Service (RAG) → Returns contextual answers
5. Interview simulation → AI generates questions → User answers → AI evaluates

## Tech Stack Details

### Frontend
- React 18 + Vite for build tooling
- Tailwind CSS for styling
- React Router v6 for routing
- Axios for HTTP client
- React Context for state management
- React PDF viewer for CV preview

### Backend
- Node.js + Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Multer for file uploads
- pdf-parse for PDF text extraction
- bcryptjs for password hashing

### AI Service
- Python FastAPI
- LangChain for LLM orchestration
- Sentence Transformers for embeddings
- ChromaDB for vector storage
- LLM API (OpenAI/Llama/Mistral)

## Database Schema

### Users Collection
- _id: ObjectId
- name: String
- email: String (unique)
- password: String (hashed)
- careerGoal: String
- createdAt: Date
- updatedAt: Date

### CVs Collection
- _id: ObjectId
- userId: ObjectId (ref: Users)
- fileName: String
- extractedText: String
- parsedData: {
    name: String,
    education: [Object],
    skills: [String],
    projects: [Object],
    experience: [Object],
    certifications: [String]
  }
- analysisResult: Object
- createdAt: Date

### Jobs Collection
- _id: ObjectId
- userId: ObjectId (ref: Users)
- title: String
- description: String
- requiredSkills: [String]
- matchResult: Object
- createdAt: Date

### ChatHistory Collection
- _id: ObjectId
- userId: ObjectId (ref: Users)
- messages: [{
    role: String,
    content: String,
    timestamp: Date
  }]

## API Routes

### Auth Routes: /api/auth
- POST /register
- POST /login
- GET /profile
- PUT /profile

### CV Routes: /api/cv
- POST /upload
- GET /:id
- GET /user/all
- DELETE /:id

### Job Routes: /api/jobs
- POST /match
- GET /history
- GET /:id

### Chat Routes: /api/chat
- POST /message
- GET /history

### Interview Routes: /api/interview
- POST /start
- POST /answer
- GET /feedback/:sessionId

### Skill Routes: /api/skills
- POST /analyze-gap
- POST /generate-roadmap

## Security
- JWT tokens with expiry
- Password hashing with bcryptjs
- Input validation with Joi
- File type validation for uploads
- CORS configuration
- Rate limiting
- Helmet for HTTP headers