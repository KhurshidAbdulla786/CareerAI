import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (credential) => api.post('/auth/google', { credential }),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// CV API
export const cvAPI = {
  upload: (formData) =>
    api.post('/cv/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }),
  getById: (id) => api.get(`/cv/${id}`),
  getAll: () => api.get('/cv/user/all'),
  delete: (id) => api.delete(`/cv/${id}`),
};

// Job Matching API
export const jobAPI = {
  match: (data) => api.post('/jobs/match', data),
  getHistory: () => api.get('/jobs/history'),
  getById: (id) => api.get(`/jobs/${id}`),
};

// Chat API
export const chatAPI = {
  sendMessage: (message) => api.post('/chat/message', { message }),
  getHistory: () => api.get('/chat/history'),
};

// Interview API
export const interviewAPI = {
  start: (role) => api.post('/interview/start', { role }),
  submitAnswer: (sessionId, questionIndex, answer) =>
    api.post('/interview/answer', { sessionId, questionIndex, answer }),
  getFeedback: (sessionId) => api.get(`/interview/feedback/${sessionId}`),
};

// Skills API
export const skillsAPI = {
  analyzeGap: (targetRole, currentSkills) =>
    api.post('/skills/analyze-gap', { targetRole, currentSkills }),
  generateRoadmap: (careerGoal, currentSkills, targetRole) =>
    api.post('/skills/generate-roadmap', { careerGoal, currentSkills, targetRole }),
};

export default api;