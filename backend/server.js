const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const config = require('./config');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate Limiting - relaxed for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.nodeEnv === 'development' ? 10000 : 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use('/api/', limiter);

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CareerAI API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cv', require('./routes/cvRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/interview', require('./routes/interviewRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Connect to MongoDB and start server with graceful port handling
const startServer = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Starting server without MongoDB (limited functionality)');
  }

  const startWithPort = (port) => {
    const server = app.listen(port, () => {
      console.log(`
╔══════════════════════════════════════════════╗
║         CareerAI Backend Server              ║
║──────────────────────────────────────────────║
║  Status: Running                             ║
║  Port: ${String(port).padEnd(37)}║
║  Environment: ${config.nodeEnv.padEnd(31)}║
║  MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected'.padEnd(29) : 'Disconnected'.padEnd(27)}║
║  AI Service: ${config.aiServiceUrl.padEnd(25)}║
╚══════════════════════════════════════════════╝
      `);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️  Port ${port} is busy, trying port ${port + 1}...`);
        server.close();
        startWithPort(port + 1);
      } else {
        console.error('❌ Server error:', err.message);
        process.exit(1);
      }
    });
  };

  startWithPort(config.port);
};

startServer();

module.exports = app;