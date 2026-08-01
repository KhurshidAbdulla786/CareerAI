const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const auth = require('../middleware/auth');
const { validate, interviewSchema } = require('../middleware/validate');

// POST /api/interview/start - Start an interview session (protected)
router.post('/start', auth, validate(interviewSchema), interviewController.startInterview);

// POST /api/interview/answer - Submit an answer (protected)
router.post('/answer', auth, interviewController.submitAnswer);

// GET /api/interview/feedback/:sessionId - Get interview feedback (protected)
router.get('/feedback/:sessionId', auth, interviewController.getFeedback);

module.exports = router;