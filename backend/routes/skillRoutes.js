const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const auth = require('../middleware/auth');
const { validate, skillGapSchema, roadmapSchema } = require('../middleware/validate');

// POST /api/skills/analyze-gap - Analyze skill gaps (protected)
router.post('/analyze-gap', auth, validate(skillGapSchema), skillController.analyzeSkillGap);

// POST /api/skills/generate-roadmap - Generate learning roadmap (protected)
router.post('/generate-roadmap', auth, validate(roadmapSchema), skillController.generateRoadmap);

module.exports = router;