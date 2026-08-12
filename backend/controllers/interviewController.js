const config = require('../config');
const axios = require('axios');

// Store active interview sessions in memory (use Redis in production)
const interviewSessions = new Map();

/**
 * Start an interview session
 * POST /api/interview/start
 */
const startInterview = async (req, res) => {
  try {
    const { role } = req.body;

    // Generate questions
    let questions = [];
    try {
      const aiResponse = await axios.post(
        `${config.aiServiceUrl}/api/ai/interview/start`,
        { role },
        { timeout: 30000 }
      );
      if (aiResponse.data.success) {
        questions = aiResponse.data.data.questions;
      }
    } catch (aiError) {
      console.warn('AI service unavailable, using local questions:', aiError.message);
      questions = generateLocalQuestions(role);
    }

    // Create session
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    interviewSessions.set(sessionId, {
      userId: req.userId,
      role,
      questions,
      currentQuestion: 0,
      answers: [],
      startTime: new Date(),
    });

    res.json({
      success: true,
      data: {
        sessionId,
        role,
        totalQuestions: questions.length,
        currentQuestion: 0,
        question: questions[0],
        questions, // Send all questions for the session
      },
    });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start interview',
      error: error.message,
    });
  }
};

/**
 * Submit an answer
 * POST /api/interview/answer
 */
const submitAnswer = async (req, res) => {
  try {
    const { sessionId, questionIndex, answer } = req.body;

    const session = interviewSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found',
      });
    }

    if (session.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized for this session',
      });
    }

    // Store answer
    session.answers.push({
      questionIndex,
      question: session.questions[questionIndex],
      answer,
      timestamp: new Date(),
    });

    session.currentQuestion = questionIndex + 1;

    // Check if interview is complete
    const isComplete = session.currentQuestion >= session.questions.length;

    if (isComplete) {
      // Generate feedback
      let feedback = null;
      try {
        const aiResponse = await axios.post(
          `${config.aiServiceUrl}/api/ai/interview/feedback`,
          {
            role: session.role,
            questions: session.questions,
            answers: session.answers.map(a => a.answer),
          },
          { timeout: 30000 }
        );
        if (aiResponse.data.success) {
          feedback = aiResponse.data.data;
        }
      } catch (aiError) {
        console.warn('AI service unavailable, using local evaluation:', aiError.message);
        feedback = localEvaluation(session);
      }

      session.feedback = feedback;
    }

    res.json({
      success: true,
      data: {
        sessionId,
        isComplete,
        currentQuestion: session.currentQuestion,
        totalQuestions: session.questions.length,
        nextQuestion: isComplete ? null : session.questions[session.currentQuestion],
        feedback: isComplete ? session.feedback : null,
      },
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit answer',
      error: error.message,
    });
  }
};

/**
 * Get interview feedback
 * GET /api/interview/feedback/:sessionId
 */
const getFeedback = async (req, res) => {
  try {
    const session = interviewSessions.get(req.params.sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found',
      });
    }

    if (session.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized for this session',
      });
    }

    res.json({
      success: true,
      data: {
        role: session.role,
        questions: session.questions,
        answers: session.answers,
        feedback: session.feedback,
        duration: Math.round((new Date() - session.startTime) / 60000),
      },
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get feedback',
      error: error.message,
    });
  }
};

/**
 * Generate local interview questions
 */
const generateLocalQuestions = (role) => {
  const roleQuestions = {
    'frontend developer': [
      'Explain the difference between controlled and uncontrolled components in React.',
      'How does the virtual DOM work in React?',
      "Describe your experience with responsive design and CSS frameworks.",
      'How do you optimize web application performance?',
      'Explain state management in React. When would you use Redux vs Context API?',
    ],
    'backend developer': [
      'Explain RESTful API design principles.',
      'How do you handle database indexing and query optimization?',
      'Describe your experience with authentication and authorization.',
      'How do you ensure API security?',
      'Explain microservices architecture and its benefits.',
    ],
    'full stack developer': [
      'Describe a full stack application you built from scratch.',
      'How do you handle data flow between frontend and backend?',
      'Explain your experience with both SQL and NoSQL databases.',
      'How do you approach deployment and DevOps?',
      'Describe your testing strategy for both frontend and backend.',
    ],
    'data scientist': [
      'Explain the difference between supervised and unsupervised learning.',
      'How do you handle missing data in a dataset?',
      'Describe a machine learning project you worked on.',
      'How do you evaluate model performance?',
      'Explain feature engineering and its importance.',
    ],
    'devops engineer': [
      'Explain CI/CD pipeline design.',
      'How do you manage containerized applications with Docker and Kubernetes?',
      'Describe your experience with cloud services (AWS/GCP/Azure).',
      'How do you implement monitoring and logging?',
      'Explain infrastructure as code principles.',
    ],
  };

  const defaultQuestions = [
    'Tell me about yourself and your technical background.',
    'Describe a challenging project you worked on and how you overcame obstacles.',
    'How do you stay updated with the latest technologies?',
    'Describe your experience with version control and collaboration tools.',
    'Where do you see yourself in your career in the next 2 years?',
  ];

  const normalizedRole = role.toLowerCase();
  for (const [key, questions] of Object.entries(roleQuestions)) {
    if (normalizedRole.includes(key)) {
      return questions;
    }
  }

  return defaultQuestions;
};

/**
 * Local interview evaluation (fallback)
 */
const localEvaluation = (session) => {
  let totalScore = 0;
  const evaluations = session.answers.map((answer, index) => {
    const wordCount = answer.answer.split(/\s+/).length;
    const hasTechnicalTerms = /api|database|framework|algorithm|function|component|architecture|system|design|pattern|test|deploy|server|client|async|promise/i.test(answer.answer);
    const isDetailed = wordCount > 30;

    let score = 50; // Base score
    if (hasTechnicalTerms) score += 20;
    if (isDetailed) score += 15;
    if (wordCount > 100) score += 10;
    if (wordCount < 15) score -= 15;

    score = Math.min(100, Math.max(0, score));
    totalScore += score;

    return {
      question: answer.question,
      answer: answer.answer,
      score,
      feedback: score >= 80
        ? 'Excellent answer! You demonstrated strong technical knowledge.'
        : score >= 60
        ? 'Good answer. Consider adding more technical details and examples.'
        : 'Your answer could be improved. Focus on providing specific examples and technical depth.',
      strengths: isDetailed ? ['Good detail', 'Structured response'] : [],
      improvements: !isDetailed ? ['Provide more specific examples'] : [],
    };
  });

  const averageScore = Math.round(totalScore / evaluations.length);

  return {
    overallScore: averageScore,
    technicalScore: averageScore + 5,
    communicationScore: averageScore - 5,
    totalQuestions: session.questions.length,
    answeredQuestions: session.answers.length,
    evaluations,
    strengths: averageScore >= 70 ? ['Good technical foundation', 'Clear communication'] : [],
    areasForImprovement: averageScore < 70 ? ['Provide more detailed answers', 'Include specific examples'] : [],
    suggestions: [
      'Practice explaining technical concepts with real-world examples',
      'Structure your answers using the STAR method',
      'Keep practicing to improve your confidence',
    ],
  };
};

module.exports = {
  startInterview,
  submitAnswer,
  getFeedback,
};