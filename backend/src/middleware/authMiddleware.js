/**
 * JWT Authentication Middleware
 * Validates bearer token in HTTP Authorization header and attaches user to req.user.
 */

const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { errorResponse } = require('../utils/responseHandler');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Access denied. No authentication token provided.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_campus_events_2026_jwt_token');

    // Fetch user from DB to verify account is still active and get fresh role
    const users = await query('SELECT id, name, email, role, phone, department, student_id_number FROM users WHERE id = ?', [decoded.id]);
    
    if (users.length === 0) {
      return errorResponse(res, 401, 'User account associated with this token no longer exists.');
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Token has expired. Please log in again.');
    }
    return errorResponse(res, 401, 'Invalid or malformed authentication token.');
  }
};

// Optional auth middleware (e.g. for event details where we want to know if current user is registered, but visitors can also view)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_campus_events_2026_jwt_token');
      const users = await query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
      if (users.length > 0) {
        req.user = users[0];
      }
    }
  } catch (err) {
    // Silently continue without user
  }
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth
};
