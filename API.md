# 📡 CareerAI — API Documentation

**Base URL:** `http://localhost:5001/api`  
**Content-Type:** `application/json`  
**Authentication:** Bearer token (JWT) — add `Authorization: Bearer <token>` header to protected routes.

---

## 🔐 Auth Routes — `/api/auth`

### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "name": "Khurshid Abdulla",
  "email": "khurshid@example.com",
  "password": "securePassword123"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "token": "eyJhbGci...",
  "user": {
    "_id": "64f...",
    "name": "Khurshid Abdulla",
    "email": "khurshid@example.com"
  }
}
```

---

### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "khurshid@example.com",
  "password": "securePassword123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": {
    "_id": "64f...",
    "name": "Khurshid Abdulla",
    "email": "khurshid@example.com",
    "isEmailVerified": true
  }
}
```

---

### POST `/api/auth/google`
Login or register via Google OAuth. Send the Google ID token from the frontend.

**Request Body:**
```json
{
  "token": "google-id-token-from-frontend"
}
```

**Response `200`:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": {
    "_id": "64f...",
    "name": "Khurshid Abdulla",
    "email": "khurshid@gmail.com",
    "isEmailVerified": true
  }
}
```

---

### GET `/api/auth/verify-email?token=<token>`
Verify a user's email address using the token sent in the verification email.

**Response `200`:**
```json
{
  "success": true,
  "message": "Email verified successfully."
}
```

---

### POST `/api/auth/resend-verification`
Resend the verification email.

**Request Body:**
```json
{
  "email": "khurshid@example.com"
}
```

---

### GET `/api/auth/profile` 🔒
Get the authenticated user's profile.

**Response `200`:**
```json
{
  "success": true,
  "user": {
    "_id": "64f...",
    "name": "Khurshid Abdulla",
    "email": "khurshid@example.com",
    "careerGoal": "Become a Full Stack Developer",
    "isEmailVerified": true,
    "createdAt": "2026-09-01T00:00:00.000Z"
  }
}
```

---

### PUT `/api/auth/profile` 🔒
Update the authenticated user's profile.

**Request Body:**
```json
{
  "name": "Khurshid Abdulla",
  "careerGoal": "Become an AI Engineer"
}
```

---

## 📄 CV Routes — `/api/cv`

### POST `/api/cv/upload` 🔒
Upload a PDF CV. Uses `multipart/form-data`.

**Form Data:**
- `cv` — PDF file (max 10MB)

**Response `201`:**
```json
{
  "success": true,
  "message": "CV uploaded and analyzed successfully",
  "cv": {
    "_id": "64f...",
    "fileName": "my-cv.pdf",
    "analysisResult": {
      "score": 78,
      "atsCompatibility": "Good",
      "strengths": ["Strong project section", "Clear formatting"],
      "weaknesses": ["Missing quantified achievements", "No LinkedIn URL"],
      "suggestions": ["Add measurable impact to each role", "Include certifications"],
      "parsedData": {
        "name": "Khurshid Abdulla",
        "skills": ["JavaScript", "React", "Node.js"],
        "education": [],
        "experience": [],
        "projects": []
      }
    }
  }
}
```

---

### GET `/api/cv/user/all` 🔒
Get all CVs uploaded by the authenticated user.

**Response `200`:**
```json
{
  "success": true,
  "cvs": [ { ... } ]
}
```

---

### GET `/api/cv/:id` 🔒
Get a specific CV by ID.

---

### DELETE `/api/cv/:id` 🔒
Delete a specific CV.

---

## 💼 Job Routes — `/api/jobs`

### POST `/api/jobs/match` 🔒
Match a job description against the user's CV skills.

**Request Body:**
```json
{
  "jobTitle": "Backend Developer",
  "jobDescription": "We are looking for a Node.js developer with experience in MongoDB, Express, REST APIs...",
  "cvId": "64f..."
}
```

**Response `200`:**
```json
{
  "success": true,
  "match": {
    "matchScore": 82,
    "matchedSkills": ["Node.js", "MongoDB", "Express"],
    "missingSkills": ["Docker", "AWS"],
    "recommendation": "Strong match! Consider adding Docker skills.",
    "keyStrengths": ["Backend expertise", "Database experience"],
    "improvementAreas": ["Cloud deployment", "CI/CD"]
  }
}
```

---

### GET `/api/jobs/history` 🔒
Get the user's job matching history.

---

### GET `/api/jobs/:id` 🔒
Get a specific job match result by ID.

---

## 🧠 Skill Routes — `/api/skills`

### POST `/api/skills/analyze-gap` 🔒
Identify skill gaps between the user's current skills and a target role.

**Request Body:**
```json
{
  "currentSkills": ["JavaScript", "React", "HTML", "CSS"],
  "targetRole": "Full Stack Developer",
  "jobDescription": "Optional job description for more accurate analysis"
}
```

**Response `200`:**
```json
{
  "success": true,
  "analysis": {
    "missingSkills": ["Node.js", "MongoDB", "Docker", "REST APIs"],
    "existingSkills": ["JavaScript", "React", "HTML", "CSS"],
    "prioritySkills": ["Node.js", "MongoDB"],
    "timeEstimate": "3-4 months",
    "overallReadiness": "60%"
  }
}
```

---

### POST `/api/skills/generate-roadmap` 🔒
Generate a personalized step-by-step learning roadmap.

**Request Body:**
```json
{
  "targetRole": "Full Stack Developer",
  "currentSkills": ["JavaScript", "React"],
  "timeframe": "3 months"
}
```

**Response `200`:**
```json
{
  "success": true,
  "roadmap": {
    "title": "Full Stack Developer Roadmap",
    "duration": "3 months",
    "phases": [
      {
        "phase": 1,
        "title": "Backend Fundamentals",
        "duration": "4 weeks",
        "skills": ["Node.js", "Express.js"],
        "resources": [
          { "name": "Node.js Official Docs", "url": "https://nodejs.org/docs", "type": "documentation" }
        ]
      }
    ]
  }
}
```

---

## 💬 Chat Routes — `/api/chat`

### POST `/api/chat/message` 🔒
Send a message to the AI career mentor.

**Request Body:**
```json
{
  "message": "How do I prepare for a React developer interview?"
}
```

**Response `200`:**
```json
{
  "success": true,
  "reply": "Great question! Here are the key areas to focus on for a React developer interview...",
  "conversationId": "64f..."
}
```

---

### GET `/api/chat/history` 🔒
Get the user's full chat history.

**Response `200`:**
```json
{
  "success": true,
  "messages": [
    { "role": "user", "content": "How do I...", "timestamp": "2026-09-01T10:00:00.000Z" },
    { "role": "assistant", "content": "Great question...", "timestamp": "2026-09-01T10:00:01.000Z" }
  ]
}
```

---

## 🎤 Interview Routes — `/api/interview`

### POST `/api/interview/start` 🔒
Start a new mock interview session.

**Request Body:**
```json
{
  "role": "Backend Developer",
  "difficulty": "intermediate",
  "cvId": "64f..."
}
```

**Response `200`:**
```json
{
  "success": true,
  "sessionId": "64f...",
  "firstQuestion": "Tell me about yourself and your experience with Node.js."
}
```

---

### POST `/api/interview/answer` 🔒
Submit an answer to the current interview question.

**Request Body:**
```json
{
  "sessionId": "64f...",
  "answer": "I have been working with Node.js for 2 years, building REST APIs..."
}
```

**Response `200`:**
```json
{
  "success": true,
  "feedback": "Good answer! You demonstrated solid understanding of...",
  "nextQuestion": "Can you explain how you handle asynchronous operations?",
  "isComplete": false
}
```

---

### GET `/api/interview/feedback/:sessionId` 🔒
Get the complete feedback report for a finished interview session.

**Response `200`:**
```json
{
  "success": true,
  "feedback": {
    "overallScore": 75,
    "strengths": ["Clear communication", "Technical accuracy"],
    "improvements": ["Add more specific examples", "Elaborate on impact"],
    "questionFeedback": [ { ... } ]
  }
}
```

---

## ❌ Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

| Status Code | Meaning |
|-------------|---------|
| `400` | Bad request / validation error |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — access denied |
| `404` | Resource not found |
| `429` | Too many requests (rate limited) |
| `500` | Internal server error |

---

## 🏥 Health Check

### GET `/health`
Check if the backend server is running.

**Response `200`:**
```json
{
  "success": true,
  "message": "CareerAI API is running",
  "timestamp": "2026-09-20T09:00:00.000Z",
  "environment": "development"
}
```
