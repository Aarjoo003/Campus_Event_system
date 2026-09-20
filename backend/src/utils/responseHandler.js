/**
 * Standardized API Response Utilities
 * Ensures all REST endpoints return a consistent JSON schema:
 * {
 *   success: true | false,
 *   message: string,
 *   data: any,
 *   errors: array | null
 * }
 */

const successResponse = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const response = {
    success: true,
    message,
    data
  };
  if (meta) {
    response.meta = meta;
  }
  return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode = 500, message = 'An error occurred', errors = null) => {
  const response = {
    success: false,
    message,
    errors: errors ? (Array.isArray(errors) ? errors : [errors]) : null
  };
  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse
};
