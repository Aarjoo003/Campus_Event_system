-- ====================================================================
-- Campus Event Management System - MySQL Database Schema
-- Compatible with MySQL 8.0+ and 9.x
-- ====================================================================

-- Create Database if it doesn't already exist
CREATE DATABASE IF NOT EXISTS campus_events_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE campus_events_db;

-- --------------------------------------------------------------------
-- 1. Users Table
-- Stores credentials and profiles for STUDENTS, ORGANIZERS, and ADMINS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'ORGANIZER', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    phone VARCHAR(20) DEFAULT NULL,
    department VARCHAR(100) DEFAULT NULL,
    student_id_number VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 2. Categories Table
-- Classifies events (e.g., Technical, Cultural, Sports, Workshops)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) DEFAULT NULL,
    color VARCHAR(50) DEFAULT 'blue',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 3. Venues Table
-- College grounds, auditoriums, seminar halls with fixed capacity
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS venues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 4. Events Table
-- Central entity for all campus events created by organizers
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category_id INT NOT NULL,
    organizer_id INT NOT NULL,
    venue_id INT NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INT NOT NULL,
    registration_deadline DATETIME NOT NULL,
    poster_url VARCHAR(500) DEFAULT NULL,
    rules TEXT DEFAULT NULL,
    contact_information VARCHAR(255) NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'APPROVED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_events_category FOREIGN KEY (category_id) 
        REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_events_organizer FOREIGN KEY (organizer_id) 
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_events_venue FOREIGN KEY (venue_id) 
        REFERENCES venues(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_events_date (event_date),
    INDEX idx_events_status (status),
    INDEX idx_events_category (category_id),
    INDEX idx_events_organizer (organizer_id)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 5. Registrations Table
-- Connects students to events they have registered for
-- Enforces UNIQUE(student_id, event_id) to prevent duplicate booking
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    event_id INT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
    CONSTRAINT fk_registrations_student FOREIGN KEY (student_id) 
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_registrations_event FOREIGN KEY (event_id) 
        REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT unique_student_event UNIQUE (student_id, event_id),
    INDEX idx_registrations_student (student_id),
    INDEX idx_registrations_event (event_id),
    INDEX idx_registrations_status (status)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 6. Attendance Table
-- Records attendance (PRESENT / ABSENT) for confirmed registrations
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registration_id INT NOT NULL UNIQUE,
    status ENUM('PRESENT', 'ABSENT') NOT NULL,
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_registration FOREIGN KEY (registration_id) 
        REFERENCES registrations(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_attendance_status (status)
) ENGINE=InnoDB;
