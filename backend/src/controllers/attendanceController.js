/**
 * Attendance Controller
 * Handles marking and updating student attendance (PRESENT / ABSENT).
 */

const attendanceModel = require('../models/attendanceModel');
const { query } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const attendanceController = {
  /**
   * Mark Attendance for a Registration ID
   * PUT /api/registrations/:id/attendance
   */
  async markAttendance(req, res, next) {
    try {
      const registrationId = Number(req.params.id);
      const { status } = req.body;

      if (!status || !['PRESENT', 'ABSENT'].includes(status.toUpperCase())) {
        return errorResponse(res, 400, 'Invalid status. Must be either "PRESENT" or "ABSENT".');
      }

      // Check registration existence and retrieve organizer
      const regRows = await query(`
        SELECT r.id, r.event_id, r.student_id, r.status AS registration_status, e.organizer_id
        FROM registrations r
        INNER JOIN events e ON r.event_id = e.id
        WHERE r.id = ?
      `, [registrationId]);

      if (regRows.length === 0) {
        return errorResponse(res, 404, 'Registration not found.');
      }

      const registration = regRows[0];

      if (registration.registration_status !== 'CONFIRMED') {
        return errorResponse(res, 400, 'Cannot mark attendance on a cancelled registration.');
      }

      // Authorization check: User must be the organizer of the event or an Admin
      if (req.user.role !== 'ADMIN' && registration.organizer_id !== req.user.id) {
        return errorResponse(res, 403, 'Forbidden: You are not authorized to mark attendance for this event.');
      }

      const normalizedStatus = status.toUpperCase();
      await attendanceModel.markAttendance(registrationId, normalizedStatus);

      return successResponse(res, 200, `Attendance marked as ${normalizedStatus}.`, {
        registrationId,
        status: normalizedStatus
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = attendanceController;
