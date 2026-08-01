const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const auth = require('../middleware/auth');
const { validate, jobMatchSchema } = require('../middleware/validate');

// POST /api/jobs/match - Match CV with job description (protected)
router.post('/match', auth, validate(jobMatchSchema), jobController.matchJob);

// GET /api/jobs/history - Get job matching history (protected)
router.get('/history', auth, jobController.getMatchHistory);

// GET /api/jobs/:id - Get job match by ID (protected)
router.get('/:id', auth, jobController.getMatchById);

module.exports = router;