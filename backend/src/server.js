/**
 * Campus Event Management System - Express Backend Server
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const registrationController = require('./controllers/registrationController');
const { authenticateToken } = require('./middleware/authMiddleware');
const { authorizeRoles } = require('./middleware/roleMiddleware');

const app = express();

// Flexible CORS for Local and Cloud Deployments (Vercel, Render, Netlify)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000'
    ].filter(Boolean);

    if (
      allowed.includes(origin) ||
      process.env.FRONTEND_URL === '*' ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.netlify.app') ||
      origin.endsWith('.onrender.com') ||
      origin.startsWith('http://localhost:')
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Allow during initial setup
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Campus Event Management System API'
  });
});

// One-Time Cloud Database Setup Endpoint (Protected by secret key)
app.all('/api/setup-database', async (req, res) => {
  const key = req.query.secret || req.headers['x-setup-key'];
  const expectedKey = process.env.JWT_SECRET || 'super_secret_jwt_key_campus_events_2026_jwt_token';

  if (!key || key !== expectedKey) {
    return res.status(403).json({ success: false, message: 'Invalid or missing setup secret key.' });
  }

  const fs = require('fs');
  const mysql = require('mysql2/promise');
  let connection;
  try {
    const poolConfig = {
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'campus_events_db',
      multipleStatements: true
    };
    if (process.env.DB_SSL === 'true' || process.env.MYSQL_SSL === 'true') {
      poolConfig.ssl = { rejectUnauthorized: false };
    }

    connection = await mysql.createConnection(poolConfig);

    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const seedPath = path.join(__dirname, '../database/seed.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    await connection.query(schemaSql);
    await connection.query(seedSql);

    return res.status(200).json({
      success: true,
      message: 'Database schema and seed data initialized successfully!',
      database: process.env.DB_NAME || 'campus_events_db'
    });
  } catch (error) {
    console.error('Setup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initialize database.',
      error: error.message
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Root Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Campus Event Management System API is live!',
    endpoints: {
      health: '/api/health',
      events: '/api/events',
      auth: '/api/auth'
    }
  });
});

// API Routes (Mounted on both /api/... and /... for maximum frontend compatibility)
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/events', '/events'], eventRoutes);
app.use(['/api/registrations', '/registrations'], registrationRoutes);
app.use(['/api/admin', '/admin'], adminRoutes);

// Direct alias for GET /api/my-events (as defined in REST spec)
app.get(
  ['/api/my-events', '/my-events'],
  authenticateToken,
  authorizeRoles('STUDENT', 'ADMIN'),
  registrationController.getMyEvents
);

// 404 Route Handler
app.use(notFound);

// Centralized Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Campus Event API Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection Details:', err.message);
});

module.exports = app;
