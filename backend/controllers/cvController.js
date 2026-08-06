const CV = require('../models/CV');
const config = require('../config');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

/**
 * Upload and analyze CV
 * POST /api/cv/upload
 */
const uploadCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file',
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Extract text from PDF
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    const extractedText = pdfData.text;

    // Create CV document with extracted text
    const cv = new CV({
      userId: req.userId,
      fileName,
      extractedText,
    });

    // Try AI analysis
    try {
      const aiResponse = await axios.post(
        `${config.aiServiceUrl}/api/ai/cv/analyze`,
        {
          cv_text: extractedText,
          file_name: fileName,
        },
        { timeout: 60000 }
      );

      if (aiResponse.data.success) {
        cv.analysisResult = aiResponse.data.data;
        cv.parsedData = cv.parsedData || {};
      }
    } catch (aiError) {
      console.warn('AI service unavailable, storing without analysis:', aiError.message);
    }

    // Parse basic info from extracted text
    cv.parsedData = extractBasicInfo(extractedText);

    await cv.save();

    res.status(201).json({
      success: true,
      message: 'CV uploaded and analyzed successfully',
      data: cv,
    });
  } catch (error) {
    console.error('CV upload error:', error);
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({
      success: false,
      message: 'Failed to upload CV',
      error: error.message,
    });
  }
};

/**
 * Get CV by ID
 * GET /api/cv/:id
 */
const getCVById = async (req, res) => {
  try {
    const cv = await CV.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found',
      });
    }

    res.json({
      success: true,
      data: cv,
    });
  } catch (error) {
    console.error('Get CV error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch CV',
      error: error.message,
    });
  }
};

/**
 * Get all CVs for current user
 * GET /api/cv/user/all
 */
const getUserCVs = async (req, res) => {
  try {
    const cvs = await CV.find({ userId: req.userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: cvs,
    });
  } catch (error) {
    console.error('Get user CVs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch CVs',
      error: error.message,
    });
  }
};

/**
 * Delete CV
 * DELETE /api/cv/:id
 */
const deleteCV = async (req, res) => {
  try {
    const cv = await CV.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found',
      });
    }

    res.json({
      success: true,
      message: 'CV deleted successfully',
    });
  } catch (error) {
    console.error('Delete CV error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete CV',
      error: error.message,
    });
  }
};

/**
 * Extract basic info from text as fallback
 */
const extractBasicInfo = (text) => {
  const lines = text.split('\n').filter((l) => l.trim());
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
  const phoneRegex = /[\+]?[\d\s-]{10,15}/;

  return {
    name: lines[0] || '',
    email: text.match(emailRegex)?.[0] || '',
    phone: text.match(phoneRegex)?.[0] || '',
    skills: extractSkills(text),
    education: [],
    projects: [],
    experience: [],
    certifications: [],
    languages: [],
  };
};

/**
 * Extract skills from text
 */
const extractSkills = (text) => {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'React', 'Node.js',
    'Express', 'MongoDB', 'SQL', 'AWS', 'Docker', 'Git', 'REST API',
    'GraphQL', 'HTML', 'CSS', 'Angular', 'Vue', 'Flutter', 'Swift',
    'Kotlin', 'Go', 'Rust', 'PHP', 'Ruby', 'C#', '.NET', 'Spring Boot',
    'Django', 'Flask', 'FastAPI', 'TensorFlow', 'PyTorch', 'Machine Learning',
    'Deep Learning', 'NLP', 'Computer Vision', 'Data Science', 'DevOps',
    'CI/CD', 'Kubernetes', 'Terraform', 'Redis', 'PostgreSQL', 'MySQL',
  ];

  return commonSkills.filter((skill) =>
    text.toLowerCase().includes(skill.toLowerCase())
  );
};

module.exports = {
  uploadCV,
  getCVById,
  getUserCVs,
  deleteCV,
};