"""
CareerAI - LLM Service
Provides AI-powered text generation using LangChain with OpenAI or mock fallback.
"""

import os
import json
import logging
from typing import List, Dict, Optional
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage

from app.config import (
    LLM_PROVIDER,
    OPENAI_API_KEY,
    OPENAI_MODEL,
    GROQ_API_KEY,
    GROQ_MODEL,
    USE_MOCK_LLM,
)

logger = logging.getLogger(__name__)

# Mock responses for development without API keys
MOCK_RESPONSES = {
    "cv_analysis": """{
  "overallScore": 72,
  "technicalSkills": {
    "rating": "Intermediate",
    "score": 65
  },
  "strengths": [
    "Strong foundation in core web technologies",
    "Good project experience with modern frameworks",
    "Clear resume structure and formatting"
  ],
  "weaknesses": [
    "Limited cloud computing experience",
    "No DevOps or containerization skills mentioned",
    "Missing soft skills section"
  ],
  "missingSkills": [
    "Docker",
    "AWS/GCP Cloud Services",
    "CI/CD Pipeline Management",
    "System Design"
  ],
  "suggestions": [
    "Add a 'Technical Skills' section with proficiency levels",
    "Include quantifiable achievements in project descriptions",
    "Add links to GitHub portfolio and live projects",
    "Include relevant certifications and online courses"
  ],
  "atsCompatibility": {
    "score": 65,
    "recommendations": [
      "Use standard section headings (Experience, Education, Skills)",
      "Include keywords from target job descriptions",
      "Avoid using tables or columns in your CV layout",
      "Save as PDF using standard fonts (Arial, Times New Roman)"
    ]
  },
  "detailedFeedback": "Your CV demonstrates solid technical foundations, particularly in web development. To strengthen your profile, focus on gaining cloud computing experience and adding more quantifiable achievements. The overall structure is good but could be optimized for ATS systems."
}""",

    "job_matching": """{
  "matchPercentage": 68,
  "matchingSkills": ["React", "Node.js", "JavaScript", "MongoDB"],
  "missingSkills": ["Docker", "AWS", "Redis", "GraphQL"],
  "explanation": "Your profile matches 68% of the job requirements. You have strong foundational skills in the core stack, but lack experience in cloud services and containerization which are important for this role.",
  "suggestions": [
    "Gain hands-on experience with Docker containers",
    "Learn AWS services (EC2, S3, Lambda)",
    "Build projects using Redis for caching",
    "Implement a GraphQL API in your next project"
  ],
  "detailedAnalysis": "The job requires proficiency in both frontend and backend technologies with cloud deployment experience. Your current skills align well with the core stack requirements. Focus on learning cloud services and containerization to improve your match percentage."
}""",

    "skill_gap": """{
  "targetRole": "Full Stack Developer",
  "matchPercentage": 55,
  "currentSkills": ["React", "Node.js", "MongoDB", "JavaScript"],
  "requiredSkills": ["React", "Node.js", "MongoDB", "JavaScript", "TypeScript", "Docker", "AWS", "GraphQL", "Redis", "CI/CD"],
  "missingSkills": ["TypeScript", "Docker", "AWS", "GraphQL", "Redis", "CI/CD"],
  "priorityAreas": [
    {
      "rank": 1,
      "skill": "TypeScript",
      "reason": "TypeScript is now standard in professional development and most job listings require it",
      "estimatedTime": "2-3 weeks",
      "resources": ["TypeScript Handbook (official)", "Execute Program TypeScript Course"]
    },
    {
      "rank": 2,
      "skill": "Docker",
      "reason": "Containerization is essential for modern deployment workflows",
      "estimatedTime": "1-2 weeks",
      "resources": ["Docker's official getting-started guide", "Docker Mastery Course on Udemy"]
    },
    {
      "rank": 3,
      "skill": "AWS",
      "reason": "Cloud deployment skills are highly valued for full-stack roles",
      "estimatedTime": "3-4 weeks",
      "resources": ["AWS Free Tier + hands-on labs", "AWS Certified Developer Associate path"]
    }
  ],
  "summary": "You have solid foundational skills. Focus on TypeScript, Docker, and AWS to significantly improve your marketability."
}""",

    "roadmap": """{
  "targetRole": "Full Stack Developer",
  "summary": "A 4-month structured learning path to become a job-ready Full Stack Developer",
  "totalDuration": "4 months",
  "weeklyHours": "15-20 hours",
  "currentSkills": ["HTML", "CSS", "JavaScript"],
  "roadmap": [
    {
      "phase": "Month 1",
      "duration": "4 weeks",
      "title": "Frontend Foundations & React",
      "topics": ["JavaScript ES6+", "React Fundamentals", "State Management", "React Hooks", "CSS Frameworks"],
      "deliverables": "Build a portfolio project with React (task manager or e-commerce UI)"
    },
    {
      "phase": "Month 2",
      "duration": "4 weeks",
      "title": "Backend Development with Node.js",
      "topics": ["Node.js & Express", "REST API Design", "MongoDB", "Authentication (JWT)", "API Testing"],
      "deliverables": "Create a REST API with user authentication and database integration"
    },
    {
      "phase": "Month 3",
      "duration": "4 weeks",
      "title": "Full Stack Integration & DevOps",
      "topics": ["Full Stack Project", "Docker Basics", "Git & CI/CD", "Cloud Deployment"],
      "deliverables": "Deploy a full stack application (React + Node.js + MongoDB) to the cloud"
    },
    {
      "phase": "Month 4",
      "duration": "4 weeks",
      "title": "Advanced Topics & Career Prep",
      "topics": ["TypeScript", "System Design Basics", "Portfolio Polish", "Interview Preparation", "Job Applications"],
      "deliverables": "Complete portfolio with 3 projects, polished resume, and interview practice"
    }
  ]
}""",

    "chat": """Based on your profile and career goals, here are my suggestions:

1. **Job Recommendations**: Your skills in React and Node.js make you a strong candidate for Full Stack Developer roles. Consider applying to companies building SaaS products.

2. **Skills to Learn Next**: Focus on TypeScript and Docker - they're the most requested skills in the current market for your profile.

3. **CV Improvements**: Quantify your achievements (e.g., 'Built app serving 1000+ users'), add a projects section with GitHub links, and include relevant coursework.

4. **Interview Preparation**: Practice system design questions and behavioral interviews using the STAR method.

Would you like me to elaborate on any of these areas?""",

    "interview_questions": [
        "Explain the concept of React Virtual DOM and how it improves performance.",
        "Describe your approach to designing a RESTful API.",
        "How do you ensure security in a web application?",
        "Explain how you would optimize the performance of a slow web application.",
        "What is the difference between SQL and NoSQL databases, and when would you use each?"
    ],

    "interview_feedback": """{
  "overallScore": 75,
  "technicalScore": 70,
  "communicationScore": 80,
  "questionsAnswered": 5,
  "summary": "You demonstrated good technical knowledge particularly in frontend technologies. Your communication is clear and structured. Focus on deepening system design concepts and providing more specific examples.",
  "strengths": [
    "Clear and concise communication style",
    "Strong understanding of frontend concepts",
    "Good problem-solving approach"
  ],
  "improvements": [
    "Provide more specific code examples in answers",
    "Deepen system design knowledge",
    "Practice explaining complex concepts more simply"
  ]
}"""
}


class LLMService:
    """Service for interacting with LLM providers."""

    def __init__(self):
        self.llm = None
        self._initialize()

    def _initialize(self):
        """Initialize the LLM based on configuration."""
        if USE_MOCK_LLM:
            logger.info("Using MOCK LLM service (USE_MOCK_LLM=true)")
            self.use_mock = True
            return

        provider = LLM_PROVIDER.lower()

        # Try Groq first (completely free)
        if provider == "groq" and GROQ_API_KEY:
            try:
                self.llm = ChatGroq(
                    model=GROQ_MODEL,
                    temperature=0.7,
                    api_key=GROQ_API_KEY,
                )
                self.use_mock = False
                logger.info(f"Initialized Groq LLM with model: {GROQ_MODEL}")
                return
            except Exception as e:
                logger.warning(f"Failed to initialize Groq: {e}")

        # Fall back to OpenAI if key is available
        if OPENAI_API_KEY:
            try:
                self.llm = ChatOpenAI(
                    model=OPENAI_MODEL,
                    temperature=0.7,
                    api_key=OPENAI_API_KEY,
                )
                self.use_mock = False
                logger.info(f"Initialized OpenAI LLM with model: {OPENAI_MODEL}")
                return
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI: {e}")

        logger.info("No valid LLM provider configured. Falling back to mock responses.")
        self.use_mock = True

    def _get_mock_response(self, prompt_type: str) -> str:
        """Get a mock response for development/testing."""
        return MOCK_RESPONSES.get(prompt_type, json.dumps({"error": "Unknown prompt type"}))

    async def analyze_cv(self, cv_text: str) -> Dict:
        """Analyze a CV and provide structured feedback."""
        if self.use_mock:
            return json.loads(self._get_mock_response("cv_analysis"))

        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content="""You are an expert CV analyzer and career coach. 
                Analyze the CV text and provide structured feedback in JSON format.
                Include: overallScore (0-100), technicalSkills (rating + score), 
                strengths (list), weaknesses (list), missingSkills (list), 
                suggestions (list), atsCompatibility (score + recommendations), 
                and detailedFeedback."""),
            HumanMessage(content=f"Analyze this CV:\n\n{cv_text[:4000]}")
        ])

        try:
            response = await self.llm.ainvoke(prompt.format_messages())
            return json.loads(response.content)
        except Exception as e:
            logger.error(f"CV analysis failed: {e}")
            return json.loads(self._get_mock_response("cv_analysis"))

    async def match_job(self, cv_text: str, job_title: str, job_description: str, required_skills: List[str]) -> Dict:
        """Match a CV with a job description."""
        if self.use_mock:
            return json.loads(self._get_mock_response("job_matching"))

        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content="""You are an expert job matching analyst.
                Compare the CV with job requirements and provide structured analysis in JSON.
                Include: matchPercentage, matchingSkills (list), missingSkills (list),
                explanation, suggestions (list), detailedAnalysis."""),
            HumanMessage(content=f"""
                Job Title: {job_title}
                Job Description: {job_description[:2000]}
                Required Skills: {', '.join(required_skills)}
                CV: {cv_text[:3000]}
            """)
        ])

        try:
            response = await self.llm.ainvoke(prompt.format_messages())
            return json.loads(response.content)
        except Exception as e:
            logger.error(f"Job matching failed: {e}")
            return json.loads(self._get_mock_response("job_matching"))

    async def analyze_skill_gap(self, target_role: str, current_skills: List[str]) -> Dict:
        """Analyze skill gaps for a target role."""
        if self.use_mock:
            return json.loads(self._get_mock_response("skill_gap"))

        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content="""You are an expert career advisor specializing in skill gap analysis.
                Provide structured analysis in JSON format.
                Include: targetRole, matchPercentage, currentSkills, requiredSkills,
                missingSkills, priorityAreas (list with rank, skill, reason, estimatedTime, resources),
                summary."""),
            HumanMessage(content=f"""
                Target Role: {target_role}
                Current Skills: {', '.join(current_skills)}
            """)
        ])

        try:
            response = await self.llm.ainvoke(prompt.format_messages())
            return json.loads(response.content)
        except Exception as e:
            logger.error(f"Skill gap analysis failed: {e}")
            return json.loads(self._get_mock_response("skill_gap"))

    async def generate_roadmap(self, career_goal: str, current_skills: List[str], target_role: str) -> Dict:
        """Generate a personalized learning roadmap."""
        if self.use_mock:
            return json.loads(self._get_mock_response("roadmap"))

        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content="""You are an expert learning path designer.
                Create a structured learning roadmap in JSON format.
                Include: targetRole, summary, totalDuration, weeklyHours, currentSkills,
                roadmap (list with phase, duration, title, topics, deliverables)."""),
            HumanMessage(content=f"""
                Career Goal: {career_goal}
                Target Role: {target_role}
                Current Skills: {', '.join(current_skills)}
            """)
        ])

        try:
            response = await self.llm.ainvoke(prompt.format_messages())
            return json.loads(response.content)
        except Exception as e:
            logger.error(f"Roadmap generation failed: {e}")
            return json.loads(self._get_mock_response("roadmap"))

    async def chat_with_context(self, message: str, context: Optional[Dict] = None) -> str:
        """Chat with career context."""
        if self.use_mock:
            return self._get_mock_response("chat")

        context_str = ""
        if context:
            context_str = f"\nUser Context:\n{json.dumps(context, indent=2)}"

        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content="""You are a knowledgeable career advisor assistant.
                Provide helpful, personalized career advice based on the user's profile and context.
                Be encouraging and practical in your suggestions."""),
            HumanMessage(content=f"{context_str}\n\nUser Message: {message}")
        ])

        try:
            response = await self.llm.ainvoke(prompt.format_messages())
            return response.content
        except Exception as e:
            logger.error(f"Chat failed: {e}")
            return self._get_mock_response("chat")

    async def generate_interview_questions(self, role: str) -> List[str]:
        """Generate interview questions for a specific role."""
        if self.use_mock:
            return self._get_mock_response("interview_questions")

        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content="""You are an interview coach. Generate 5 relevant 
                technical interview questions for the given role. Return as a JSON array of strings."""),
            HumanMessage(content=f"Generate interview questions for a {role} position.")
        ])

        try:
            response = await self.llm.ainvoke(prompt.format_messages())
            return json.loads(response.content)
        except Exception as e:
            logger.error(f"Question generation failed: {e}")
            return self._get_mock_response("interview_questions")

    async def evaluate_answer(self, question: str, answer: str) -> Dict:
        """Evaluate an interview answer."""
        if self.use_mock:
            return json.loads(self._get_mock_response("interview_feedback"))

        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content="""You are an interview evaluator. Evaluate the candidate's answer.
                Provide feedback in JSON format.
                Include: score (0-100), feedback (detailed), strengths (list), 
                improvements (list), suggestedAnswer."""),
            HumanMessage(content=f"""
                Question: {question}
                Candidate's Answer: {answer}
            """)
        ])

        try:
            response = await self.llm.ainvoke(prompt.format_messages())
            return json.loads(response.content)
        except Exception as e:
            logger.error(f"Answer evaluation failed: {e}")
            return json.loads(self._get_mock_response("interview_feedback"))


# Singleton instance
llm_service = LLMService()