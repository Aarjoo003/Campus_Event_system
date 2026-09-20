/**
 * Central Error Handling Middleware
 */

const { errorResponse } = require('../utils/responseHandler');

// 404 Route Not Found
const notFound = (req, res, next) => {
  return errorResponse(res, 404, `API route not found - ${req.originalUrl}`);
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  console.error('[Error Details]:', err);

  // MySQL specific errors
  if (err.code === 'ER_DUP_ENTRY') {
    return errorResponse(res, 409, 'Duplicate entry: A record with these details already exists.');
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
    return errorResponse(res, 400, 'Invalid foreign reference: Related record does not exist.');
  }

  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 401, 'Invalid authentication token.');
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 401, 'Authentication token has expired. Please login again.');
  }

  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const message = err.message || 'Internal Server Error';

  return errorResponse(
    res,
    statusCode,
    message,
    process.env.NODE_ENV === 'development' ? err.stack : null
  );
};

module.exports = {
  notFound,
  errorHandler
};
