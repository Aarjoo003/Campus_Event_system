/**
 * Lookup and Analytics Model
 * Provides metadata (categories, venues) and aggregated statistics for Admin and Student dashboards.
 */

const { query } = require('../config/db');

const lookupModel = {
  async getAllCategories() {
    return await query('SELECT * FROM categories ORDER BY name ASC');
  },

  async getAllVenues() {
    return await query('SELECT * FROM venues ORDER BY name ASC');
  },

  async getAdminDashboardStats() {
    const [counts] = await query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'STUDENT') AS total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'ORGANIZER') AS total_organizers,
        (SELECT COUNT(*) FROM events) AS total_events,
        (SELECT COUNT(*) FROM events WHERE status = 'PENDING') AS pending_events,
        (SELECT COUNT(*) FROM events WHERE status = 'APPROVED') AS approved_events,
        (SELECT COUNT(*) FROM registrations WHERE status = 'CONFIRMED') AS total_registrations,
        (SELECT COUNT(*) FROM attendance WHERE status = 'PRESENT') AS total_attended
    `);

    const recentRegistrations = await query(`
      SELECT 
        r.id, r.registered_at, r.status,
        u.name AS student_name, u.email AS student_email,
        e.title AS event_title, e.event_date
      FROM registrations r
      INNER JOIN users u ON r.student_id = u.id
      INNER JOIN events e ON r.event_id = e.id
      ORDER BY r.registered_at DESC
      LIMIT 5
    `);

    const upcomingEvents = await query(`
      SELECT 
        e.id, e.title, e.event_date, e.start_time, e.capacity, e.status,
        c.name AS category_name, v.name AS venue_name, u.name AS organizer_name,
        COUNT(CASE WHEN r.status = 'CONFIRMED' THEN 1 END) AS registered_count
      FROM events e
      INNER JOIN categories c ON e.category_id = c.id
      INNER JOIN venues v ON e.venue_id = v.id
      INNER JOIN users u ON e.organizer_id = u.id
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.event_date >= CURDATE()
      GROUP BY e.id, c.name, v.name, u.name
      ORDER BY e.event_date ASC
      LIMIT 5
    `);

    return {
      stats: counts,
      recentRegistrations,
      upcomingEvents
    };
  },

  async getStudentDashboardStats(studentId) {
    const [counts] = await query(`
      SELECT
        (SELECT COUNT(*) FROM registrations WHERE student_id = ? AND status = 'CONFIRMED') AS registered_events_count,
        (SELECT COUNT(*) FROM registrations r 
         INNER JOIN attendance a ON r.id = a.registration_id 
         WHERE r.student_id = ? AND a.status = 'PRESENT') AS attended_events_count
    `, [studentId, studentId]);

    const upcomingEvents = await query(`
      SELECT 
        r.id AS registration_id, r.registered_at,
        e.id AS event_id, e.title, e.event_date, e.start_time, e.end_time, e.poster_url,
        c.name AS category_name, c.color AS category_color,
        v.name AS venue_name, v.location AS venue_location
      FROM registrations r
      INNER JOIN events e ON r.event_id = e.id
      INNER JOIN categories c ON e.category_id = c.id
      INNER JOIN venues v ON e.venue_id = v.id
      WHERE r.student_id = ? 
        AND r.status = 'CONFIRMED'
        AND e.event_date >= CURDATE()
      ORDER BY e.event_date ASC, e.start_time ASC
      LIMIT 5
    `, [studentId]);

    const recentRegistrations = await query(`
      SELECT 
        r.id AS registration_id, r.registered_at, r.status,
        e.id AS event_id, e.title, e.event_date,
        c.name AS category_name, v.name AS venue_name,
        a.status AS attendance_status
      FROM registrations r
      INNER JOIN events e ON r.event_id = e.id
      INNER JOIN categories c ON e.category_id = c.id
      INNER JOIN venues v ON e.venue_id = v.id
      LEFT JOIN attendance a ON r.id = a.registration_id
      WHERE r.student_id = ?
      ORDER BY r.registered_at DESC
      LIMIT 5
    `, [studentId]);

    return {
      counts: counts || { registered_events_count: 0, attended_events_count: 0 },
      upcomingEvents,
      recentRegistrations
    };
  },

  async getOrganizerDashboardStats(organizerId) {
    const [counts] = await query(`
      SELECT
        (SELECT COUNT(*) FROM events WHERE organizer_id = ?) AS total_events,
        (SELECT COUNT(*) FROM registrations r 
         INNER JOIN events e ON r.event_id = e.id 
         WHERE e.organizer_id = ? AND r.status = 'CONFIRMED') AS total_registrations,
        (SELECT COUNT(*) FROM attendance a 
         INNER JOIN registrations r ON a.registration_id = r.id 
         INNER JOIN events e ON r.event_id = e.id 
         WHERE e.organizer_id = ? AND a.status = 'PRESENT') AS total_attended
    `, [organizerId, organizerId, organizerId]);

    const myEvents = await query(`
      SELECT 
        e.id, e.title, e.event_date, e.start_time, e.capacity, e.status,
        c.name AS category_name, v.name AS venue_name,
        COUNT(CASE WHEN r.status = 'CONFIRMED' THEN 1 END) AS registered_count
      FROM events e
      INNER JOIN categories c ON e.category_id = c.id
      INNER JOIN venues v ON e.venue_id = v.id
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.organizer_id = ?
      GROUP BY e.id, c.name, v.name
      ORDER BY e.event_date DESC
    `, [organizerId]);

    return {
      counts: counts || { total_events: 0, total_registrations: 0, total_attended: 0 },
      myEvents
    };
  }
};

module.exports = lookupModel;
