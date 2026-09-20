/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces permissions at the route handler level based on user role.
 */

const { errorResponse } = require('../utils/responseHandler');

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required to access this resource.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Forbidden: Role '${req.user.role}' is not authorized to perform this action.`
      );
    }

    next();
  };
};

module.exports = {
  authorizeRoles
};
