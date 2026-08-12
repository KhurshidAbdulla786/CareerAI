const Job = require('../models/Job');
const CV = require('../models/CV');
const config = require('../config');
const axios = require('axios');

/**
 * Match CV with job description
 * POST /api/jobs/match
 */
const matchJob = async (req, res) => {
  try {
    const { title, description, requiredSkills } = req.body;

    // Get the user's latest CV
    const cv = await CV.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    if (!cv) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a CV first before matching with jobs',
      });
    }

    // Create job entry
    const job = new Job({
      userId: req.userId,
      title,
      description,
      requiredSkills,
    });

    // Try AI-powered matching
    try {
      const aiResponse = await axios.post(
        `${config.aiServiceUrl}/api/ai/jobs/match`,
        {
          cv_text: cv.extractedText,
          job_title: title,
          job_description: description,
          required_skills: requiredSkills || [],
        },
        { timeout: 60000 }
      );

      if (aiResponse.data.success) {
        job.matchResult = aiResponse.data.data;
      }
    } catch (aiError) {
      console.warn('AI service unavailable, performing local matching:', aiError.message);
      // Perform local matching as fallback
      job.matchResult = localJobMatch(cv.parsedData?.skills || [], requiredSkills, description);
    }

    await job.save();

    res.json({
      success: true,
      message: 'Job match analysis completed',
      data: job,
    });
  } catch (error) {
    console.error('Job match error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze job match',
      error: error.message,
    });
  }
};

/**
 * Get job matching history
 * GET /api/jobs/history
 */
const getMatchHistory = async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error('Get match history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch match history',
      error: error.message,
    });
  }
};

/**
 * Get job match by ID
 * GET /api/jobs/:id
 */
const getMatchById = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job match not found',
      });
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job match',
      error: error.message,
    });
  }
};

/**
 * Local job matching algorithm (fallback when AI service is down)
 */
const localJobMatch = (cvSkills, requiredSkills, description) => {
  const normalizedCVSkills = cvSkills.map((s) => s.toLowerCase());
  const normalizedRequiredSkills = requiredSkills.map((s) => s.toLowerCase());

  // Find matching and missing skills
  const matchingSkills = normalizedRequiredSkills.filter((skill) =>
    normalizedCVSkills.includes(skill)
  );
  const missingSkills = normalizedRequiredSkills.filter(
    (skill) => !normalizedCVSkills.includes(skill)
  );

  // Calculate match percentage
  const matchPercentage =
    requiredSkills.length > 0
      ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
      : 0;

  // Generate explanation
  let explanation = '';
  if (matchPercentage >= 80) {
    explanation = 'Your profile is an excellent match for this position!';
  } else if (matchPercentage >= 60) {
    explanation = 'You have a good foundation, but there are some areas to improve.';
  } else if (matchPercentage >= 40) {
    explanation = 'You meet some requirements, but significant skill gaps exist.';
  } else {
    explanation = 'This role may require substantial upskilling.';
  }

  // Generate suggestions
  const suggestions = missingSkills.map(
    (skill) => `Consider learning ${skill} to strengthen your application`
  );

  return {
    matchPercentage,
    matchingSkills: matchingSkills.map(
      (s) => requiredSkills[normalizedRequiredSkills.indexOf(s)]
    ),
    missingSkills: missingSkills.map(
      (s) => requiredSkills[normalizedRequiredSkills.indexOf(s)]
    ),
    explanation,
    suggestions,
    detailedAnalysis: `Your CV contains ${matchingSkills.length} out of ${requiredSkills.length} required skills. ${explanation}`,
  };
};

module.exports = {
  matchJob,
  getMatchHistory,
  getMatchById,
};