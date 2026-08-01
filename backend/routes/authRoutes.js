const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { validate, registerSchema, loginSchema, profileSchema } = require('../middleware/validate');

// POST /api/auth/register - Register a new user
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login - Login user
router.post('/login', validate(loginSchema), authController.login);

// POST /api/auth/google - Google OAuth login
router.post('/google', authController.googleLogin);

// GET /api/auth/verify-email - Verify email address
router.get('/verify-email', authController.verifyEmail);

// POST /api/auth/resend-verification - Resend verification email
router.post('/resend-verification', authController.resendVerification);

// GET /api/auth/profile - Get user profile (protected)
router.get('/profile', auth, authController.getProfile);

// PUT /api/auth/profile - Update user profile (protected)
router.put('/profile', auth, validate(profileSchema), authController.updateProfile);

module.exports = router;