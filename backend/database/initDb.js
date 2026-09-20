/**
 * Database Initialization and Seed Script
 * Connects to MySQL using credentials configured in backend/.env,
 * creates the database `campus_events_db`, executes `schema.sql`, and runs `seed.sql`.
 * 
 * Usage:
 *   npm run db:init (from inside the backend/ folder)
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

if (process.env.DB_SSL === 'true' || process.env.MYSQL_SSL === 'true') {
  dbConfig.ssl = { rejectUnauthorized: false };
}

async function initializeDatabase() {
  console.log('----------------------------------------------------');
  console.log('Campus Event Management System - Database Initializer');
  console.log('----------------------------------------------------');
  console.log(`Connecting to MySQL server at ${dbConfig.host}:${dbConfig.port} as user "${dbConfig.user}"...`);

  let connection;
  try {
    // 1. Establish initial connection without database selected
    connection = await mysql.createConnection(dbConfig);
    console.log(' Connected to MySQL server successfully.');

    // 2. Read schema.sql and execute
    const schemaPath = path.join(__dirname, 'schema.sql');
    console.log(`\n Reading and executing schema: ${schemaPath}`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schemaSql);
    console.log(' Database and tables created successfully.');

    // 3. Read seed.sql and execute
    const seedPath = path.join(__dirname, 'seed.sql');
    console.log(`\n Reading and executing seed data: ${seedPath}`);
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await connection.query(seedSql);
    console.log(' Seed data inserted successfully.');

    console.log('\n====================================================');
    console.log(' Database initialization complete!');
    console.log(' Database: campus_events_db');
    console.log(' Demo credentials:');
    console.log('   Admin:      admin@campus.edu        / password123');
    console.log('   Organizer:  tech.club@campus.edu    / password123');
    console.log('   Student:    student1@campus.edu     / password123');
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n Error initializing database:');
    console.error(error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n Tip: Please check DB_USER and DB_PASSWORD in backend/.env.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n Tip: MySQL server does not seem to be running on the specified host/port.');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();
