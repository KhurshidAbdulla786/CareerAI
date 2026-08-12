const Joi = require('joi');

/**
 * Validation middleware factory
 * Validates request body against a Joi schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }
    next();
  };
};

// Auth Schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 50 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

const profileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  careerGoal: Joi.string().max(200),
});

const jobMatchSchema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': 'Job title is required',
  }),
  description: Joi.string().required().messages({
    'any.required': 'Job description is required',
  }),
  requiredSkills: Joi.array().items(Joi.string()).default([]),
});

const chatSchema = Joi.object({
  message: Joi.string().required().messages({
    'any.required': 'Message is required',
  }),
});

const skillGapSchema = Joi.object({
  targetRole: Joi.string().required().messages({
    'any.required': 'Target role is required',
  }),
  currentSkills: Joi.array().items(Joi.string()).required().messages({
    'any.required': 'Current skills are required',
  }),
});

const roadmapSchema = Joi.object({
  careerGoal: Joi.string().required().messages({
    'any.required': 'Career goal is required',
  }),
  currentSkills: Joi.array().items(Joi.string()).required().messages({
    'any.required': 'Current skills are required',
  }),
  targetRole: Joi.string().required().messages({
    'any.required': 'Target role is required',
  }),
});

const interviewSchema = Joi.object({
  role: Joi.string().required().messages({
    'any.required': 'Job role is required',
  }),
  question: Joi.string(),
  answer: Joi.string(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  profileSchema,
  jobMatchSchema,
  chatSchema,
  skillGapSchema,
  roadmapSchema,
  interviewSchema,
};