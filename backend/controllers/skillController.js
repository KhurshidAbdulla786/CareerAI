const config = require('../config');
const CV = require('../models/CV');
const axios = require('axios');

/**
 * Analyze skill gaps
 * POST /api/skills/analyze-gap
 */
const analyzeSkillGap = async (req, res) => {
  try {
    const { targetRole, currentSkills } = req.body;

    // Try AI-powered analysis
    try {
      const aiResponse = await axios.post(
        `${config.aiServiceUrl}/api/ai/skills/analyze-gap`,
        { target_role: targetRole, current_skills: currentSkills },
        { timeout: 30000 }
      );

      if (aiResponse.data.success) {
        return res.json({
          success: true,
          data: aiResponse.data.data,
        });
      }
    } catch (aiError) {
      console.warn('AI service unavailable, using local analysis:', aiError.message);
    }

    // Local fallback analysis
    const result = localSkillGapAnalysis(targetRole, currentSkills);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Skill gap analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze skill gaps',
      error: error.message,
    });
  }
};

/**
 * Generate learning roadmap
 * POST /api/skills/generate-roadmap
 */
const generateRoadmap = async (req, res) => {
  try {
    const { careerGoal, currentSkills, targetRole } = req.body;

    // Try AI-powered generation
    try {
      const aiResponse = await axios.post(
        `${config.aiServiceUrl}/api/ai/skills/generate-roadmap`,
        { career_goal: careerGoal, current_skills: currentSkills, target_role: targetRole },
        { timeout: 60000 }
      );

      if (aiResponse.data.success) {
        return res.json({
          success: true,
          data: aiResponse.data.data,
        });
      }
    } catch (aiError) {
      console.warn('AI service unavailable, using local generator:', aiError.message);
    }

    // Local fallback roadmap generation
    const roadmap = localRoadmapGenerator(careerGoal, currentSkills, targetRole);
    res.json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    console.error('Roadmap generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate roadmap',
      error: error.message,
    });
  }
};

/**
 * Local skill gap analysis (fallback)
 */
const localSkillGapAnalysis = (targetRole, currentSkills) => {
  const skillDatabase = {
    'frontend developer': ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Git', 'REST APIs', 'Responsive Design', 'Webpack', 'Testing'],
    'backend developer': ['Node.js', 'Python', 'Java', 'SQL', 'MongoDB', 'REST APIs', 'Docker', 'Git', 'AWS', 'System Design'],
    'full stack developer': ['React', 'Node.js', 'SQL', 'MongoDB', 'Git', 'Docker', 'AWS', 'TypeScript', 'REST APIs', 'System Design'],
    'data scientist': ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Deep Learning', 'Data Visualization', 'Pandas', 'NumPy', 'TensorFlow', 'R'],
    'devops engineer': ['Docker', 'Kubernetes', 'AWS/GCP/Azure', 'CI/CD', 'Terraform', 'Linux', 'Python', 'Git', 'Monitoring', 'Security'],
    'mobile developer': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'REST APIs', 'Git', 'UI/UX', 'App Store Deployment'],
  };

  const normalizedRole = targetRole.toLowerCase();
  let requiredSkills = [];

  for (const [role, skills] of Object.entries(skillDatabase)) {
    if (normalizedRole.includes(role)) {
      requiredSkills = skills;
      break;
    }
  }

  if (requiredSkills.length === 0) {
    requiredSkills = ['JavaScript', 'Python', 'Git', 'REST APIs', 'SQL', 'Communication', 'Problem Solving'];
  }

  const normalizedCurrent = currentSkills.map((s) => s.toLowerCase());
  const missingSkills = requiredSkills.filter(
    (skill) => !normalizedCurrent.includes(skill.toLowerCase())
  );

  // Priority learning areas
  const priorityAreas = missingSkills.slice(0, 5).map((skill, index) => ({
    rank: index + 1,
    skill,
    reason: getSkillPriorityReason(skill, targetRole),
    estimatedTime: getEstimatedTime(skill),
    resources: getLearningResources(skill),
  }));

  return {
    currentSkills,
    requiredSkills,
    missingSkills,
    matchPercentage: Math.round(
      ((requiredSkills.length - missingSkills.length) / requiredSkills.length) * 100
    ),
    priorityAreas,
    summary: missingSkills.length === 0
      ? 'You have all the required skills for this role!'
      : `You need to acquire ${missingSkills.length} more skills to be fully prepared for this role.`,
  };
};

/**
 * Generate local roadmap (fallback)
 */
const localRoadmapGenerator = (careerGoal, currentSkills, targetRole) => {
  const roadmaps = {
    'frontend developer': [
      { month: 1, title: 'HTML/CSS Fundamentals & JavaScript Deep Dive', topics: ['Semantic HTML', 'CSS Grid/Flexbox', 'JavaScript ES6+', 'DOM Manipulation'], deliverables: 'Build a responsive portfolio website' },
      { month: 2, title: 'React & Modern Frontend', topics: ['React Fundamentals', 'Hooks & Context', 'State Management', 'React Router'], deliverables: 'Build a React todo app with authentication' },
      { month: 3, title: 'Advanced Frontend & Tooling', topics: ['TypeScript', 'Webpack/Vite', 'Testing (Jest)', 'Performance Optimization'], deliverables: 'Build a full-featured React dashboard' },
      { month: 4, title: 'Production Ready Skills', topics: ['REST API Integration', 'Authentication', 'Deployment (Vercel/Netlify)', 'CI/CD Basics'], deliverables: 'Deploy a complete frontend application' },
    ],
    'backend developer': [
      { month: 1, title: 'Backend Fundamentals', topics: ['Node.js/Express', 'REST API Design', 'Database Basics (SQL)', 'Authentication'], deliverables: 'Build a REST API with CRUD operations' },
      { month: 2, title: 'Database & Advanced APIs', topics: ['MongoDB/Mongoose', 'PostgreSQL', 'GraphQL Basics', 'API Security'], deliverables: 'Build a complete backend with multiple data sources' },
      { month: 3, title: 'DevOps & Deployment', topics: ['Docker', 'AWS Basics (EC2/S3)', 'CI/CD Pipeline', 'Monitoring'], deliverables: 'Containerize and deploy backend application' },
      { month: 4, title: 'System Design & Scaling', topics: ['System Design', 'Caching (Redis)', 'Message Queues', 'Microservices'], deliverables: 'Design and implement a scalable architecture' },
    ],
    'full stack developer': [
      { month: 1, title: 'Full Stack Foundation', topics: ['React Review', 'Node.js/Express', 'MongoDB', 'REST API Design'], deliverables: 'Build a MERN stack CRUD app' },
      { month: 2, title: 'Advanced Full Stack', topics: ['Authentication (JWT)', 'File Upload', 'State Management', 'API Security'], deliverables: 'Build a full stack app with user authentication' },
      { month: 3, title: 'DevOps & Cloud', topics: ['Docker', 'AWS/Cloud Deployment', 'CI/CD', 'Environment Management'], deliverables: 'Deploy full stack app with Docker' },
      { month: 4, title: 'Production & Scaling', topics: ['Testing (Jest/Supertest)', 'Performance', 'Caching', 'Monitoring'], deliverables: 'Production-ready full stack application' },
    ],
  };

  const normalizedRole = targetRole.toLowerCase();
  let roadmap = null;
  for (const [role, months] of Object.entries(roadmaps)) {
    if (normalizedRole.includes(role)) {
      roadmap = [
        { phase: 'Foundation', duration: 'Month 1', ...months[0] },
        { phase: 'Core Skills', duration: 'Month 2', ...months[1] },
        { phase: 'Advanced', duration: 'Month 3', ...months[2] },
        { phase: 'Production Ready', duration: 'Month 4', ...months[3] },
      ];
      break;
    }
  }

  if (!roadmap) {
    roadmap = [
      { phase: 'Foundation', duration: 'Month 1', title: 'Core Programming', topics: ['Language Fundamentals', 'Data Structures', 'Git', 'Basic Tools'], deliverables: 'Build command-line applications' },
      { phase: 'Core Skills', duration: 'Month 2', title: 'Web Development Basics', topics: ['HTML/CSS', 'JavaScript', 'Databases', 'REST APIs'], deliverables: 'Build a basic web application' },
      { phase: 'Advanced', duration: 'Month 3', title: 'Specialization', topics: ['Framework Deep Dive', 'Cloud Basics', 'Testing', 'Security'], deliverables: 'Build a specialized application' },
      { phase: 'Production Ready', duration: 'Month 4', title: 'Professional Skills', topics: ['DevOps', 'System Design', 'Best Practices', 'Portfolio Building'], deliverables: 'Deploy a production-ready application' },
    ];
  }

  return {
    careerGoal,
    targetRole,
    currentSkills,
    roadmap,
    totalDuration: '4 months',
    weeklyHours: '15-20 hours',
    summary: `Personalized ${targetRole} learning roadmap generated for "${careerGoal}". Complete this program in 4 months with dedicated effort.`,
  };
};

/**
 * Helper functions for skill gap analysis
 */
const getSkillPriorityReason = (skill, role) => {
  const reasons = {
    'Docker': 'Industry standard for containerization and deployment',
    'AWS': 'Most widely used cloud platform',
    'System Design': 'Critical for senior engineering roles',
    'TypeScript': 'Adds type safety to JavaScript, highly demanded',
    'Testing': 'Essential for production-quality code',
  };
  return reasons[skill] || `Important skill for ${role} roles`;
};

const getEstimatedTime = (skill) => {
  const times = {
    'Docker': '2-3 weeks',
    'AWS': '4-6 weeks',
    'System Design': '4-8 weeks',
    'TypeScript': '2-3 weeks',
    'Testing': '2-3 weeks',
  };
  return times[skill] || '3-4 weeks';
};

const getLearningResources = (skill) => {
  const resources = {
    'Docker': ['Docker Documentation', 'Docker Mastery Course (Udemy)'],
    'AWS': ['AWS Certified Developer Course', 'AWS Documentation'],
    'System Design': ['Designing Data-Intensive Applications', 'Grokking System Design'],
    'TypeScript': ['TypeScript Handbook', 'TypeScript Course (freeCodeCamp)'],
    'Testing': ['Testing JavaScript (Kent C. Dodds)', 'Jest Documentation'],
  };
  return resources[skill] || ['Official Documentation', 'Online Courses (Coursera/Udemy)'];
};

module.exports = {
  analyzeSkillGap,
  generateRoadmap,
};