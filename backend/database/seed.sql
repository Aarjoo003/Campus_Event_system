-- ====================================================================
-- Campus Event Management System - Seed Data
-- Seed data into currently active connected database


-- --------------------------------------------------------------------
-- 1. Insert Categories
-- --------------------------------------------------------------------
INSERT INTO categories (id, name, description, color) VALUES
(1, 'Technical & Coding', 'Hackathons, coding contests, technical paper presentations, and tech talks', 'blue'),
(2, 'Cultural & Arts', 'Music, dance, theatrical drama, fashion shows, and art exhibitions', 'purple'),
(3, 'Sports & Athletics', 'Inter-department and university sports tournaments, athletics, and indoor games', 'emerald'),
(4, 'Academic & Workshops', 'Hands-on technical workshops, career seminars, research conferences', 'amber'),
(5, 'Entrepreneurship & Business', 'Startup pitching, business case studies, innovation showcases', 'rose'),
(6, 'Social & Community', 'Blood donation camps, campus green drives, community outreach initiatives', 'teal')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- --------------------------------------------------------------------
-- 2. Insert Venues
-- --------------------------------------------------------------------
INSERT INTO venues (id, name, location, capacity) VALUES
(1, 'Dr. APJ Abdul Kalam Auditorium', 'Academic Block A, Ground Floor', 500),
(2, 'Turing Seminar Hall', 'Tech Park, 2nd Floor', 150),
(3, 'Central Sports Complex & Arena', 'West Campus Grounds', 800),
(4, 'Robotics & Innovation Lab', 'Engineering Wing B, Room 304', 60),
(5, 'Open Air Amphitheatre', 'Campus Central Garden', 1200),
(6, 'Student Activity Center Hall', 'SAC Complex, 1st Floor', 250)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- --------------------------------------------------------------------
-- 3. Insert Users (All demo users have password: password123)
-- Hash: $2a$10$Ls8FusYsE5DXc0Q4IuQoeOGx4m2M2e/DetwDDLSaJmum.8IUg0FvK
-- --------------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, role, phone, department, student_id_number) VALUES
-- Admin
(1, 'System Administrator', 'admin@campus.edu', '$2a$10$Ls8FusYsE5DXc0Q4IuQoeOGx4m2M2e/DetwDDLSaJmum.8IUg0FvK', 'ADMIN', '+1-555-0100', 'Dean of Student Affairs', 'ADM-001'),

-- Organizers
(2, 'Tech Innovation Club', 'tech.club@campus.edu', '$2a$10$Ls8FusYsE5DXc0Q4IuQoeOGx4m2M2e/DetwDDLSaJmum.8IUg0FvK', 'ORGANIZER', '+1-555-0101', 'Computer Science & Engg', 'ORG-101'),
(3, 'Cultural Affairs Council', 'cultural.sec@campus.edu', '$2a$10$Ls8FusYsE5DXc0Q4IuQoeOGx4m2M2e/DetwDDLSaJmum.8IUg0FvK', 'ORGANIZER', '+1-555-0102', 'Humanities & Fine Arts', 'ORG-102'),
(4, 'Campus Sports Committee', 'sports.officer@campus.edu', '$2a$10$Ls8FusYsE5DXc0Q4IuQoeOGx4m2M2e/DetwDDLSaJmum.8IUg0FvK', 'ORGANIZER', '+1-555-0103', 'Physical Education Dept', 'ORG-103'),

-- Students
(5, 'Alex Johnson', 'student1@campus.edu', '$2a$10$Ls8FusYsE5DXc0Q4IuQoeOGx4m2M2e/DetwDDLSaJmum.8IUg0FvK', 'STUDENT', '+1-555-0201', 'Computer Science', 'CS-2024-001'),
(6, 'Priya Sharma', 'student2@campus.edu', '$2a$10$Ls8FusYsE5DXc0Q4IuQoeOGx4m2M2e/DetwDDLSaJmum.8IUg0FvK', 'STUDENT', '+1-555-0202', 'Electronics & Comm', 'EC-2024-042'),
(7, 'David Miller', 'student3@campus.edu', '$2a$10$Ls8FusYsE5DXc0Q4IuQoeOGx4m2M2e/DetwDDLSaJmum.8IUg0FvK', 'STUDENT', '+1-555-0203', 'Mechanical Engg', 'ME-2024-018'),
(8, 'Sara Williams', 'student4@campus.edu', '$2a$10$Ls8FusYsE5DXc0Q4IuQoeOGx4m2M2e/DetwDDLSaJmum.8IUg0FvK', 'STUDENT', '+1-555-0204', 'Biotechnology', 'BT-2024-007')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- --------------------------------------------------------------------
-- 4. Insert Events
-- --------------------------------------------------------------------
INSERT INTO events (id, title, description, category_id, organizer_id, venue_id, event_date, start_time, end_time, capacity, registration_deadline, poster_url, rules, contact_information, status) VALUES
(1, 
 'CodeStorm 2026: 24-Hour National Hackathon', 
 'Join the most awaited annual college hackathon! Build groundbreaking solutions in Web3, Generative AI, Sustainability, and Healthcare. Mentorship from industry experts and prize pool of $10,000.', 
 1, 2, 1, 
 '2026-10-15', '09:00:00', '18:00:00', 200, 
 '2026-10-14 23:59:59', 
 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80', 
 '1. Teams of 2-4 members.\n2. All code must be written during the 24-hour hackathon period.\n3. Bring your college ID and own laptops.', 
 'tech.club@campus.edu | +1-555-0101', 
 'APPROVED'),

(2, 
 'Symphony 2026: Annual Cultural Extravaganza', 
 'Experience an electrifying night of live musical band performances, classical fusion, contemporary dance troupes, and visual arts installations under the open sky.', 
 2, 3, 5, 
 '2026-10-22', '17:30:00', '22:30:00', 600, 
 '2026-10-21 20:00:00', 
 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80', 
 '1. Entry strictly with confirmed registration QR/badge.\n2. College ID required at gates.\n3. Outside food/drinks not permitted inside amphitheatre.', 
 'cultural.sec@campus.edu | +1-555-0102', 
 'APPROVED'),

(3, 
 'Hands-on Generative AI & LLM Engineering Workshop', 
 'Comprehensive workshop covering LangChain, Vector Databases, RAG architectures, and fine-tuning open-source models with hands-on labs.', 
 4, 2, 2, 
 '2026-10-28', '10:00:00', '16:00:00', 120, 
 '2026-10-27 18:00:00', 
 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80', 
 '1. Prerequisite: basic Python familiarity.\n2. Bring laptop with Google Chrome and VS Code installed.', 
 'tech.club@campus.edu | +1-555-0101', 
 'APPROVED'),

(4, 
 'Inter-Department Badminton Championship 2026', 
 'Showcase your athletic prowess in singles and doubles format. Trophies, medals, and university athletic credit points for all winners and runners-up.', 
 3, 4, 3, 
 '2026-11-02', '08:30:00', '17:00:00', 64, 
 '2026-11-01 12:00:00', 
 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80', 
 '1. Non-marking shoes compulsory in arena.\n2. Players must bring personal racquets.\n3. Tournament follows standard BWF rules.', 
 'sports.officer@campus.edu | +1-555-0103', 
 'APPROVED'),

(5, 
 'Campus Startup Pitch Day & Venture Summit', 
 'Pitch your early-stage venture ideas directly to angel investors, venture capitalists, and successful college alumni founders. Seed grants available.', 
 5, 2, 6, 
 '2026-11-08', '11:00:00', '16:30:00', 100, 
 '2026-11-07 17:00:00', 
 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80', 
 '1. 5-minute pitch deck + 3 minutes Q&A.\n2. Executive pitch deck to be submitted 24h prior to event.', 
 'startup.hub@campus.edu | +1-555-0199', 
 'APPROVED'),

(6, 
 'CyberDefenders: Capture The Flag (CTF) Tournament', 
 'Jeopardy-style CTF challenge focusing on web vulnerabilities, binary exploitation, reverse engineering, cryptography, and digital forensics.', 
 1, 2, 2, 
 '2026-11-12', '10:00:00', '18:00:00', 80, 
 '2026-11-11 22:00:00', 
 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80', 
 '1. Individual or dual participation.\n2. Zero tolerance for attacking platform infrastructure.', 
 'security.club@campus.edu | +1-555-0101', 
 'APPROVED'),

(7, 
 'Battle of the Bands: Rock & Acoustic Spotlight', 
 'Annual musical showcase featuring campus rock, indie, jazz, and acoustic ensembles competing for the campus trophy and recording studio time.', 
 2, 3, 5, 
 '2026-11-18', '18:00:00', '22:00:00', 500, 
 '2026-11-17 19:00:00', 
 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80', 
 '1. Band setup time: max 10 minutes.\n2. Performance slot: 15 minutes max per band.', 
 'cultural.sec@campus.edu | +1-555-0102', 
 'APPROVED'),

(8, 
 'Cloud DevOps & Kubernetes Masterclass', 
 'Learn modern container orchestration, CI/CD pipeline building with GitHub Actions, and production Kubernetes deployment fundamentals.', 
 4, 2, 2, 
 '2026-11-22', '09:30:00', '15:30:00', 90, 
 '2026-11-21 21:00:00', 
 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80', 
 '1. Docker desktop pre-installed is recommended.\n2. Free cloud trial vouchers provided at check-in.', 
 'tech.club@campus.edu | +1-555-0101', 
 'APPROVED'),

(9, 
 'Campus Annual Photography & Digital Media Expo', 
 'Theme: "Light, Perspectives, and Life on Campus". Juried exhibition with gallery walk, critiques by professional photographers, and awards.', 
 2, 3, 6, 
 '2026-11-25', '11:00:00', '17:00:00', 150, 
 '2026-11-24 18:00:00', 
 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80', 
 '1. Submissions must be original work taken within the current academic year.\n2. Both DSLR and mobile categories.', 
 'photo.society@campus.edu | +1-555-0102', 
 'APPROVED'),

(10, 
 'Intra-Campus Cricket Super League 2026', 
 'Fast-paced T10 knockout cricket tournament between department teams. Live streaming and campus-wide coverage.', 
 3, 4, 3, 
 '2026-11-29', '09:00:00', '18:00:00', 250, 
 '2026-11-27 20:00:00', 
 'https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=1200&q=80', 
 '1. 11 players per squad + 3 substitutes.\n2. Proper whites/team jerseys mandatory.\n3. Tournament referee decisions are final.', 
 'sports.officer@campus.edu | +1-555-0103', 
 'APPROVED'),

(11, 
 'Autonomous Robotics Maze Navigation Contest', 
 'Design and race autonomous micro-mouse robots solving unknown mazes in record time using IR, lidar, and ultrasonic sensors.', 
 1, 2, 4, 
 '2026-12-05', '10:00:00', '16:00:00', 50, 
 '2026-12-04 18:00:00', 
 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80', 
 '1. Robot size limit: 20cm x 20cm x 20cm.\n2. Pure autonomous operation, no remote control permitted.', 
 'tech.club@campus.edu | +1-555-0101', 
 'APPROVED'),

(12, 
 'Campus Green Earth Tree Plantation & Cleanup Drive', 
 'Join the student council for an eco-friendly campus restoration drive. Plant saplings, install recycling bins, and make our campus carbon-neutral.', 
 6, 3, 5, 
 '2026-12-10', '08:00:00', '13:00:00', 200, 
 '2026-12-09 20:00:00', 
 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80', 
 '1. Gardening gloves and tools will be provided.\n2. Certificate of environmental volunteering issued.', 
 'green.campus@campus.edu | +1-555-0102', 
 'APPROVED')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- --------------------------------------------------------------------
-- 5. Insert Sample Registrations
-- --------------------------------------------------------------------
INSERT INTO registrations (id, student_id, event_id, status) VALUES
(1, 5, 1, 'CONFIRMED'), -- Alex Johnson registered for CodeStorm Hackathon
(2, 5, 3, 'CONFIRMED'), -- Alex registered for AI Workshop
(3, 5, 6, 'CONFIRMED'), -- Alex registered for CTF Challenge
(4, 6, 1, 'CONFIRMED'), -- Priya Sharma registered for CodeStorm
(5, 6, 2, 'CONFIRMED'), -- Priya registered for Symphony Cultural Fest
(6, 6, 8, 'CONFIRMED'), -- Priya registered for Cloud DevOps Masterclass
(7, 7, 4, 'CONFIRMED'), -- David registered for Badminton Championship
(8, 7, 10, 'CONFIRMED'), -- David registered for Cricket League
(9, 8, 2, 'CONFIRMED'), -- Sara registered for Symphony Cultural Fest
(10, 8, 5, 'CONFIRMED') -- Sara registered for Startup Pitch Day
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- --------------------------------------------------------------------
-- 6. Insert Sample Attendance
-- --------------------------------------------------------------------
INSERT INTO attendance (id, registration_id, status) VALUES
(1, 1, 'PRESENT'),
(2, 4, 'PRESENT'),
(3, 7, 'PRESENT'),
(4, 9, 'ABSENT')
ON DUPLICATE KEY UPDATE status=VALUES(status);
