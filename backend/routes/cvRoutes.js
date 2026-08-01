const express = require('express');
const router = express.Router();
const cvController = require('../controllers/cvController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// POST /api/cv/upload - Upload and analyze CV (protected)
router.post('/upload', auth, upload.single('cv'), cvController.uploadCV);

// GET /api/cv/user/all - Get all CVs for user (protected)
router.get('/user/all', auth, cvController.getUserCVs);

// GET /api/cv/:id - Get CV by ID (protected)
router.get('/:id', auth, cvController.getCVById);

// DELETE /api/cv/:id - Delete CV (protected)
router.delete('/:id', auth, cvController.deleteCV);

module.exports = router;