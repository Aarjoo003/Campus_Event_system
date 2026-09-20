/**
 * Request Input Validation Middleware
 * Checks results from express-validator schemas and returns formatted 400 responses.
 */

const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/responseHandler');

const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return errorResponse(res, 400, 'Validation failed. Please correct the highlighted errors.', formattedErrors);
  };
};

module.exports = {
  validate
};
