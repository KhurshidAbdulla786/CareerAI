const ChatHistory = require('../models/ChatHistory');
const CV = require('../models/CV');
const config = require('../config');
const axios = require('axios');

/**
 * Send a chat message to the AI career assistant
 * POST /api/chat/message
 */
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    // Get or create chat history
    let chat = await ChatHistory.findOne({ userId: req.userId });
    if (!chat) {
      chat = new ChatHistory({ userId: req.userId, messages: [] });
    }

    // Add user message
    chat.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Get CV context for RAG
    const cv = await CV.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    const cvContext = cv?.extractedText?.substring(0, 4000) || '';

    try {
      // Try AI-powered response
      const aiResponse = await axios.post(
        `${config.aiServiceUrl}/api/ai/chat/message`,
        {
          message,
          context: {
            cvContext,
            chatHistory: chat.messages.slice(-10),
          },
        },
        { timeout: 30000 }
      );

      if (aiResponse.data.success) {
        chat.messages.push({
          role: 'assistant',
          content: aiResponse.data.data.response,
          timestamp: new Date(),
        });
      }
    } catch (aiError) {
      console.warn('AI service unavailable, using local response:', aiError.message);
      // Use local fallback response
      const localResponse = generateLocalResponse(message, cv);
      chat.messages.push({
        role: 'assistant',
        content: localResponse,
        timestamp: new Date(),
      });
    }

    // Keep only last 50 messages to manage document size
    if (chat.messages.length > 50) {
      chat.messages = chat.messages.slice(-50);
    }

    await chat.save();

    res.json({
      success: true,
      data: {
        messages: chat.messages,
        response: chat.messages[chat.messages.length - 1].content,
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: error.message,
    });
  }
};

/**
 * Get chat history
 * GET /api/chat/history
 */
const getChatHistory = async (req, res) => {
  try {
    const chat = await ChatHistory.findOne({ userId: req.userId });
    res.json({
      success: true,
      data: chat?.messages || [],
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history',
      error: error.message,
    });
  }
};

/**
 * Generate local response as fallback
 */
const generateLocalResponse = (message, cv) => {
  const msg = message.toLowerCase();
  const skills = cv?.parsedData?.skills || [];

  if (msg.includes('job') || msg.includes('role') || msg.includes('position')) {
    if (skills.length > 0) {
      return `Based on your CV, you have skills in: ${skills.join(', ')}. Consider exploring roles like Software Developer, Full Stack Developer, or Backend Engineer. Would you like me to analyze a specific job description for you?`;
    }
    return 'I can help you find suitable job roles. Please upload your CV first so I can analyze your skills and suggest matching positions.';
  }

  if (msg.includes('learn') || msg.includes('skill') || msg.includes('improve')) {
    if (skills.length > 0) {
      return `Your current skills include: ${skills.join(', ')}. To enhance your profile, consider learning complementary technologies. What career path are you interested in? I can create a personalized learning roadmap.`;
    }
    return 'I can help you plan your learning journey! What technologies are you currently working with, and what role are you targeting?';
  }

  if (msg.includes('cv') || msg.includes('resume') || msg.includes('improve')) {
    return 'I can analyze your CV and provide suggestions for improvement. Upload your CV (PDF format) and I will give you detailed feedback including ATS compatibility, missing skills, and optimization tips.';
  }

  if (msg.includes('interview') || msg.includes('prepare')) {
    return 'I can help you prepare for interviews! Tell me the role you are targeting, and I will generate relevant interview questions, evaluate your answers, and provide feedback.';
  }

  return 'I am your AI Career Assistant! I can help you with:\n\n1. 📄 CV Analysis & Improvement\n2. 💼 Job Matching\n3. 🎯 Skill Gap Analysis\n4. 📚 Learning Roadmaps\n5. 🎤 Interview Preparation\n\nWhat would you like help with?';
};

module.exports = {
  sendMessage,
  getChatHistory,
};