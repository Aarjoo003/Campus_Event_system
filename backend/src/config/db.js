/**
 * Database Configuration and Connection Pool
 * Uses mysql2/promise for async/await query execution and connection pooling.
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campus_events_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true // Returns MySQL DATE/DATETIME as strings to prevent timezone shifts
});

// Helper for executing a query directly from the pool
const query = async (sql, params = []) => {
  const [results] = await pool.execute(sql, params);
  return results;
};

// Helper to obtain a dedicated connection for transactions
const getConnection = async () => {
  return await pool.getConnection();
};

module.exports = {
  pool,
  query,
  getConnection
};
