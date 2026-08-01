const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');
const { validate, chatSchema } = require('../middleware/validate');

// POST /api/chat/message - Send chat message (protected)
router.post('/message', auth, validate(chatSchema), chatController.sendMessage);

// GET /api/chat/history - Get chat history (protected)
router.get('/history', auth, chatController.getChatHistory);

module.exports = router;