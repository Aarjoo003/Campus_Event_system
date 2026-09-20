/**
 * Event Model / Database Operations
 * Handles relational queries between events, categories, venues, organizers, and registrations.
 */

const { query } = require('../config/db');

const eventModel = {
  /**
   * Fetch events with filters, registration counts, and dynamic available seats.
   */
  async getAllEvents({
    search = '',
    categoryId = null,
    venueId = null,
    date = null,
    status = 'APPROVED', // By default, only approved events for public
    organizerId = null,
    upcomingOnly = false,
    currentUserId = null,
    limit = 50,
    offset = 0
  } = {}) {
    let sql = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.category_id,
        c.name AS category_name,
        c.color AS category_color,
        e.organizer_id,
        u.name AS organizer_name,
        u.email AS organizer_email,
        e.venue_id,
        v.name AS venue_name,
        v.location AS venue_location,
        e.event_date,
        e.start_time,
        e.end_time,
        e.capacity,
        e.registration_deadline,
        e.poster_url,
        e.rules,
        e.contact_information,
        e.status,
        e.created_at,
        COUNT(CASE WHEN r.status = 'CONFIRMED' THEN 1 END) AS registered_count,
        GREATEST(e.capacity - COUNT(CASE WHEN r.status = 'CONFIRMED' THEN 1 END), 0) AS available_seats
    `;

    const params = [];

    if (currentUserId) {
      sql += `,
        EXISTS(
          SELECT 1 FROM registrations r2 
          WHERE r2.event_id = e.id AND r2.student_id = ? AND r2.status = 'CONFIRMED'
        ) AS is_registered
      `;
      params.push(currentUserId);
    } else {
      sql += `, FALSE AS is_registered`;
    }

    sql += `
      FROM events e
      INNER JOIN categories c ON e.category_id = c.id
      INNER JOIN users u ON e.organizer_id = u.id
      INNER JOIN venues v ON e.venue_id = v.id
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE 1=1
    `;

    if (status && status !== 'ALL') {
      sql += ` AND e.status = ?`;
      params.push(status);
    }

    if (organizerId) {
      sql += ` AND e.organizer_id = ?`;
      params.push(organizerId);
    }

    if (categoryId) {
      sql += ` AND e.category_id = ?`;
      params.push(categoryId);
    }

    if (venueId) {
      sql += ` AND e.venue_id = ?`;
      params.push(venueId);
    }

    if (date) {
      sql += ` AND e.event_date = ?`;
      params.push(date);
    }

    if (upcomingOnly) {
      sql += ` AND e.event_date >= CURDATE()`;
    }

    if (search && search.trim() !== '') {
      sql += ` AND (e.title LIKE ? OR e.description LIKE ? OR c.name LIKE ? OR v.name LIKE ?)`;
      const searchParam = `%${search.trim()}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    sql += `
      GROUP BY e.id, c.name, c.color, u.name, u.email, v.name, v.location
      ORDER BY e.event_date ASC, e.start_time ASC
      LIMIT ? OFFSET ?
    `;
    params.push(Number(limit), Number(offset));

    return await query(sql, params);
  },

  /**
   * Get single event by ID with rich details
   */
  async getEventById(id, currentUserId = null) {
    let sql = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.category_id,
        c.name AS category_name,
        c.color AS category_color,
        e.organizer_id,
        u.name AS organizer_name,
        u.email AS organizer_email,
        u.phone AS organizer_phone,
        e.venue_id,
        v.name AS venue_name,
        v.location AS venue_location,
        v.capacity AS venue_capacity,
        e.event_date,
        e.start_time,
        e.end_time,
        e.capacity,
        e.registration_deadline,
        e.poster_url,
        e.rules,
        e.contact_information,
        e.status,
        e.created_at,
        COUNT(CASE WHEN r.status = 'CONFIRMED' THEN 1 END) AS registered_count,
        GREATEST(e.capacity - COUNT(CASE WHEN r.status = 'CONFIRMED' THEN 1 END), 0) AS available_seats
    `;

    const params = [];

    if (currentUserId) {
      sql += `,
        EXISTS(
          SELECT 1 FROM registrations r2 
          WHERE r2.event_id = e.id AND r2.student_id = ? AND r2.status = 'CONFIRMED'
        ) AS is_registered,
        (
          SELECT r3.id FROM registrations r3 
          WHERE r3.event_id = e.id AND r3.student_id = ? AND r3.status = 'CONFIRMED'
          LIMIT 1
        ) AS current_user_registration_id
      `;
      params.push(currentUserId, currentUserId);
    } else {
      sql += `, FALSE AS is_registered, NULL AS current_user_registration_id`;
    }

    sql += `
      FROM events e
      INNER JOIN categories c ON e.category_id = c.id
      INNER JOIN users u ON e.organizer_id = u.id
      INNER JOIN venues v ON e.venue_id = v.id
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.id = ?
      GROUP BY e.id, c.name, c.color, u.name, u.email, u.phone, v.name, v.location, v.capacity
    `;
    params.push(id);

    const rows = await query(sql, params);
    return rows[0] || null;
  },

  /**
   * Create a new event
   */
  async createEvent({
    title,
    description,
    category_id,
    organizer_id,
    venue_id,
    event_date,
    start_time,
    end_time,
    capacity,
    registration_deadline,
    poster_url,
    rules,
    contact_information,
    status = 'APPROVED'
  }) {
    const result = await query(
      `INSERT INTO events (
        title, description, category_id, organizer_id, venue_id, 
        event_date, start_time, end_time, capacity, registration_deadline, 
        poster_url, rules, contact_information, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        category_id,
        organizer_id,
        venue_id,
        event_date,
        start_time,
        end_time,
        capacity,
        registration_deadline,
        poster_url || null,
        rules || null,
        contact_information,
        status
      ]
    );
    return result.insertId;
  },

  /**
   * Update an existing event
   */
  async updateEvent(id, data) {
    const allowedFields = [
      'title', 'description', 'category_id', 'venue_id',
      'event_date', 'start_time', 'end_time', 'capacity',
      'registration_deadline', 'poster_url', 'rules', 'contact_information', 'status'
    ];

    const updates = [];
    const params = [];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (updates.length === 0) return false;

    params.push(id);
    await query(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`, params);
    return true;
  },

  /**
   * Delete event
   */
  async deleteEvent(id) {
    return await query('DELETE FROM events WHERE id = ?', [id]);
  },

  /**
   * Update event status (for Admin approval or Organizer cancellation)
   */
  async updateStatus(id, status) {
    return await query('UPDATE events SET status = ? WHERE id = ?', [status, id]);
  }
};

module.exports = eventModel;
