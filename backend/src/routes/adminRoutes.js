/**
 * Admin and Role Dashboard Routes
 * Mounted at /api/admin
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// System-wide Admin Dashboard Metrics
router.get(
  '/dashboard',
  authenticateToken,
  authorizeRoles('ADMIN'),
  adminController.getDashboardStats
);

// Manage Users
router.get(
  '/users',
  authenticateToken,
  authorizeRoles('ADMIN'),
  adminController.getAllUsers
);

router.put(
  '/users/:id/role',
  authenticateToken,
  authorizeRoles('ADMIN'),
  adminController.updateUserRole
);

router.delete(
  '/users/:id',
  authenticateToken,
  authorizeRoles('ADMIN'),
  adminController.deleteUser
);

// Moderate Events (Approve, Reject)
router.put(
  '/events/:id/status',
  authenticateToken,
  authorizeRoles('ADMIN'),
  adminController.updateEventStatus
);

// Student Dashboard summary
router.get(
  '/student/dashboard',
  authenticateToken,
  authorizeRoles('STUDENT', 'ADMIN'),
  adminController.getStudentDashboard
);

// Organizer Dashboard summary
router.get(
  '/organizer/dashboard',
  authenticateToken,
  authorizeRoles('ORGANIZER', 'ADMIN'),
  adminController.getOrganizerDashboard
);

module.exports = router;
