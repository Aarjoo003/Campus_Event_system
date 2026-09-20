/**
 * Attendance Model / Database Operations
 */

const { query } = require('../config/db');

const attendanceModel = {
  /**
   * Mark or update attendance for a registration
   */
  async markAttendance(registrationId, status) {
    const validStatuses = ['PRESENT', 'ABSENT'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const sql = `
      INSERT INTO attendance (registration_id, status, marked_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE 
        status = VALUES(status),
        marked_at = CURRENT_TIMESTAMP
    `;
    return await query(sql, [registrationId, status]);
  },

  /**
   * Get attendance summary for an event
   */
  async getEventAttendanceSummary(eventId) {
    const sql = `
      SELECT 
        COUNT(CASE WHEN r.status = 'CONFIRMED' THEN 1 END) AS total_confirmed,
        COUNT(CASE WHEN a.status = 'PRESENT' THEN 1 END) AS total_present,
        COUNT(CASE WHEN a.status = 'ABSENT' THEN 1 END) AS total_absent,
        COUNT(CASE WHEN r.status = 'CONFIRMED' AND a.status IS NULL THEN 1 END) AS total_unmarked
      FROM registrations r
      LEFT JOIN attendance a ON r.id = a.registration_id
      WHERE r.event_id = ?
    `;
    const rows = await query(sql, [eventId]);
    return rows[0];
  }
};

module.exports = attendanceModel;
