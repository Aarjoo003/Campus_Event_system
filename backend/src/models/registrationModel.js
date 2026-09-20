/**
 * Registration Model / Database Operations
 * Handles event registrations, student event history, and capacity checks using transactions.
 */

const { query, getConnection } = require('../config/db');

const registrationModel = {
  /**
   * Register a student for an event within an ACID transaction
   */
  async registerStudent(studentId, eventId) {
    const conn = await getConnection();
    try {
      await conn.beginTransaction();

      // 1. Lock and check event existence, deadline, capacity and status
      const [events] = await conn.execute(
        `SELECT 
          e.id, e.title, e.capacity, e.status, e.registration_deadline, e.event_date,
          COUNT(CASE WHEN r.status = 'CONFIRMED' THEN 1 END) AS active_registrations
        FROM events e
        LEFT JOIN registrations r ON e.id = r.event_id
        WHERE e.id = ?
        GROUP BY e.id
        FOR UPDATE`,
        [eventId]
      );

      if (events.length === 0) {
        await conn.rollback();
        return { error: 'EVENT_NOT_FOUND', message: 'Event not found.' };
      }

      const event = events[0];

      if (event.status !== 'APPROVED') {
        await conn.rollback();
        return { error: 'EVENT_NOT_ACTIVE', message: `Cannot register: Event is currently ${event.status.toLowerCase()}.` };
      }

      // 2. Check registration deadline
      const deadline = new Date(event.registration_deadline);
      const now = new Date();
      if (deadline < now) {
        await conn.rollback();
        return { error: 'DEADLINE_PASSED', message: 'Registration has closed for this event.' };
      }

      // 3. Check capacity limit
      if (Number(event.active_registrations) >= Number(event.capacity)) {
        await conn.rollback();
        return { error: 'EVENT_FULL', message: 'Sorry, this event has reached maximum capacity.' };
      }

      // 4. Check if student already has a registration
      const [existing] = await conn.execute(
        'SELECT id, status FROM registrations WHERE student_id = ? AND event_id = ?',
        [studentId, eventId]
      );

      if (existing.length > 0) {
        if (existing[0].status === 'CONFIRMED') {
          await conn.rollback();
          return { error: 'ALREADY_REGISTERED', message: 'You are already registered for this event.' };
        } else {
          // Reactivate previously cancelled registration
          await conn.execute(
            'UPDATE registrations SET status = "CONFIRMED", registered_at = CURRENT_TIMESTAMP WHERE id = ?',
            [existing[0].id]
          );
          await conn.commit();
          return { success: true, registrationId: existing[0].id, reconfirmed: true };
        }
      }

      // 5. Insert new confirmed registration
      const [insertResult] = await conn.execute(
        'INSERT INTO registrations (student_id, event_id, status) VALUES (?, ?, "CONFIRMED")',
        [studentId, eventId]
      );

      await conn.commit();
      return { success: true, registrationId: insertResult.insertId, reconfirmed: false };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /**
   * Cancel an existing registration
   */
  async cancelRegistration(studentId, eventId) {
    const registrations = await query(
      'SELECT id, status FROM registrations WHERE student_id = ? AND event_id = ?',
      [studentId, eventId]
    );

    if (registrations.length === 0) {
      return { error: 'NOT_FOUND', message: 'Registration record not found.' };
    }

    if (registrations[0].status === 'CANCELLED') {
      return { error: 'ALREADY_CANCELLED', message: 'Registration has already been cancelled.' };
    }

    await query(
      'UPDATE registrations SET status = "CANCELLED" WHERE id = ?',
      [registrations[0].id]
    );

    return { success: true };
  },

  /**
   * Get all registrations for a student (My Events)
   */
  async getStudentRegistrations(studentId) {
    const sql = `
      SELECT 
        r.id AS registration_id,
        r.registered_at,
        r.status AS registration_status,
        a.status AS attendance_status,
        a.marked_at AS attendance_marked_at,
        e.id AS event_id,
        e.title,
        e.description,
        e.event_date,
        e.start_time,
        e.end_time,
        e.poster_url,
        e.contact_information,
        e.rules,
        e.status AS event_status,
        c.name AS category_name,
        c.color AS category_color,
        v.name AS venue_name,
        v.location AS venue_location,
        u.name AS organizer_name
      FROM registrations r
      INNER JOIN events e ON r.event_id = e.id
      INNER JOIN categories c ON e.category_id = c.id
      INNER JOIN venues v ON e.venue_id = v.id
      INNER JOIN users u ON e.organizer_id = u.id
      LEFT JOIN attendance a ON r.id = a.registration_id
      WHERE r.student_id = ?
      ORDER BY e.event_date DESC, e.start_time DESC
    `;
    return await query(sql, [studentId]);
  },

  /**
   * Get student registrations for a specific event (for Organizer/Admin)
   */
  async getEventRegistrations(eventId) {
    const sql = `
      SELECT 
        r.id AS registration_id,
        r.registered_at,
        r.status AS registration_status,
        u.id AS student_id,
        u.name AS student_name,
        u.email AS student_email,
        u.phone AS student_phone,
        u.department,
        u.student_id_number,
        a.id AS attendance_id,
        a.status AS attendance_status,
        a.marked_at AS attendance_marked_at
      FROM registrations r
      INNER JOIN users u ON r.student_id = u.id
      LEFT JOIN attendance a ON r.id = a.registration_id
      WHERE r.event_id = ?
      ORDER BY r.registered_at DESC
    `;
    return await query(sql, [eventId]);
  }
};

module.exports = registrationModel;
