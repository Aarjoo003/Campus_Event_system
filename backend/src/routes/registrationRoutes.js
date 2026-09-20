/**
 * Registration and Attendance Routes
 * Mounted at /api/registrations and /api/my-events
 */

const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Get current student's registrations (My Events)
router.get(
  '/my-events',
  authenticateToken,
  authorizeRoles('STUDENT', 'ADMIN'),
  registrationController.getMyEvents
);

// Mark/Update attendance for a registration ID (Organizer or Admin)
router.put(
  '/:id/attendance',
  authenticateToken,
  authorizeRoles('ORGANIZER', 'ADMIN'),
  attendanceController.markAttendance
);

module.exports = router;
