/**
 * Database Table Viewer Utility
 * Prints the current rows in campus_events_db directly to the console.
 * 
 * Usage:
 *   npm run db:view (from inside backend/ folder)
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function viewDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'campus_events_db',
      dateStrings: true
    });

    console.log('\n======================================================');
    console.log('       CAMPUS EVENT MANAGEMENT SYSTEM - DATABASE      ');
    console.log('======================================================\n');

    // 1. USERS TABLE
    console.log('📌 1. USERS TABLE (SELECT id, name, email, role, department, student_id_number FROM users):');
    const [users] = await connection.query(
      'SELECT id, name, email, role, department, student_id_number FROM users ORDER BY id ASC'
    );
    console.table(users);

    // 2. CATEGORIES TABLE
    console.log('\n📌 2. CATEGORIES TABLE:');
    const [categories] = await connection.query(
      'SELECT id, name, color FROM categories ORDER BY id ASC'
    );
    console.table(categories);

    // 3. VENUES TABLE
    console.log('\n📌 3. VENUES TABLE:');
    const [venues] = await connection.query(
      'SELECT id, name, location, capacity FROM venues ORDER BY id ASC'
    );
    console.table(venues);

    // 4. EVENTS TABLE
    console.log('\n📌 4. EVENTS TABLE (First 10 events):');
    const [events] = await connection.query(`
      SELECT 
        e.id, 
        e.title, 
        c.name AS category, 
        v.name AS venue, 
        e.event_date, 
        e.capacity,
        e.status
      FROM events e
      INNER JOIN categories c ON e.category_id = c.id
      INNER JOIN venues v ON e.venue_id = v.id
      ORDER BY e.id ASC
      LIMIT 10
    `);
    console.table(events);

    // 5. REGISTRATIONS TABLE
    console.log('\n📌 5. REGISTRATIONS TABLE:');
    const [registrations] = await connection.query(`
      SELECT 
        r.id,
        u.name AS student_name,
        e.title AS event_title,
        r.registered_at,
        r.status AS registration_status
      FROM registrations r
      INNER JOIN users u ON r.student_id = u.id
      INNER JOIN events e ON r.event_id = e.id
      ORDER BY r.id ASC
    `);
    console.table(registrations);

    // 6. ATTENDANCE TABLE
    console.log('\n📌 6. ATTENDANCE TABLE:');
    const [attendance] = await connection.query(`
      SELECT 
        a.id,
        u.name AS student_name,
        e.title AS event_title,
        a.status AS attendance_status,
        a.marked_at
      FROM attendance a
      INNER JOIN registrations r ON a.registration_id = r.id
      INNER JOIN users u ON r.student_id = u.id
      INNER JOIN events e ON r.event_id = e.id
      ORDER BY a.id ASC
    `);
    console.table(attendance);

    console.log('\n Query complete. Database connection closed.\n');

  } catch (err) {
    console.error('Error querying database:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

viewDatabase();
