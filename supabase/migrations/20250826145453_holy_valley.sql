/*
  # Insert Updated Sample Data with New User ID Format

  1. Sample Data
    - Default admin user for first-time setup
    - Sample school with proper format
    - Sample users with new user_id format
    - Sample relationships and data

  2. User ID Format
    - Format: schoolcode-role-serialnumber
    - Examples: greenwood-admin-001, greenwood-teacher-001
*/

-- Clear existing data
DELETE FROM homework_submissions;
DELETE FROM attendance;
DELETE FROM messages;
DELETE FROM notifications;
DELETE FROM fees;
DELETE FROM homework;
DELETE FROM exams;
DELETE FROM classes;
DELETE FROM students;
DELETE FROM teachers;
DELETE FROM subjects;
DELETE FROM users;
DELETE FROM schools;

-- Insert default school for first-time setup
INSERT INTO schools (id, name, code, region, admin_email, address, phone, website, created_at) VALUES
('00000000-0000-0000-0000-000000000000', 'Default System', 'default', 'System', 'admin@edumesh.com', 'System Default', '', '', now());

-- Insert sample school
INSERT INTO schools (id, name, code, region, admin_email, address, phone, website, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Greenwood High School', 'greenwood', 'North District', 'admin@greenwood.edu', '123 Education Street, Learning City, LC 12345', '+1-555-0100', 'https://greenwood.edu', now());

-- Insert default admin user for first-time setup
INSERT INTO users (id, user_id, name, email, phone, role, school_id, is_active, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'default-admin', 'System Administrator', 'admin@edumesh.com', '+1-555-0000', 'admin', '00000000-0000-0000-0000-000000000000', true, now());

-- Insert sample users with new user_id format
INSERT INTO users (id, user_id, name, email, phone, role, school_id, is_active, created_at) VALUES
-- Admins
('550e8400-e29b-41d4-a716-446655440001', 'greenwood-admin-001', 'Dr. Sarah Wilson', 'admin@greenwood.edu', '+1-555-0101', 'admin', '550e8400-e29b-41d4-a716-446655440000', true, now()),

-- Teachers
('550e8400-e29b-41d4-a716-446655440002', 'greenwood-teacher-001', 'Sarah Johnson', 'sarah.johnson@greenwood.edu', '+1-555-0102', 'teacher', '550e8400-e29b-41d4-a716-446655440000', true, now()),
('550e8400-e29b-41d4-a716-446655440003', 'greenwood-teacher-002', 'Michael Chen', 'michael.chen@greenwood.edu', '+1-555-0103', 'teacher', '550e8400-e29b-41d4-a716-446655440000', true, now()),
('550e8400-e29b-41d4-a716-446655440004', 'greenwood-teacher-003', 'Emily Rodriguez', 'emily.rodriguez@greenwood.edu', '+1-555-0104', 'teacher', '550e8400-e29b-41d4-a716-446655440000', true, now()),

-- Parents
('550e8400-e29b-41d4-a716-446655440005', 'greenwood-parent-001', 'John Thompson', 'john.thompson@parent.com', '+1-555-0105', 'parent', '550e8400-e29b-41d4-a716-446655440000', true, now()),
('550e8400-e29b-41d4-a716-446655440006', 'greenwood-parent-002', 'Mary Wilson', 'mary.wilson@parent.com', '+1-555-0106', 'parent', '550e8400-e29b-41d4-a716-446655440000', true, now()),
('550e8400-e29b-41d4-a716-446655440007', 'greenwood-parent-003', 'David Davis', 'david.davis@parent.com', '+1-555-0107', 'parent', '550e8400-e29b-41d4-a716-446655440000', true, now()),

-- Students
('550e8400-e29b-41d4-a716-446655440008', 'greenwood-student-001', 'Alex Thompson', 'alex.thompson@student.greenwood.edu', '+1-555-0108', 'student', '550e8400-e29b-41d4-a716-446655440000', true, now()),
('550e8400-e29b-41d4-a716-446655440009', 'greenwood-student-002', 'Emma Wilson', 'emma.wilson@student.greenwood.edu', '+1-555-0109', 'student', '550e8400-e29b-41d4-a716-446655440000', true, now()),
('550e8400-e29b-41d4-a716-446655440010', 'greenwood-student-003', 'James Davis', 'james.davis@student.greenwood.edu', '+1-555-0110', 'student', '550e8400-e29b-41d4-a716-446655440000', true, now()),
('550e8400-e29b-41d4-a716-446655440011', 'greenwood-student-004', 'Sophie Chen', 'sophie.chen@student.greenwood.edu', '+1-555-0111', 'student', '550e8400-e29b-41d4-a716-446655440000', true, now());

-- Insert subjects
INSERT INTO subjects (id, school_id, name, code, description, color, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Mathematics', 'MATH', 'Mathematics and Algebra', '#3B82F6', now()),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'English', 'ENG', 'English Language and Literature', '#10B981', now()),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Science', 'SCI', 'General Science', '#8B5CF6', now()),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Physics', 'PHY', 'Physics and Applied Sciences', '#F59E0B', now()),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Chemistry', 'CHEM', 'Chemistry and Chemical Sciences', '#EF4444', now()),
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'Biology', 'BIO', 'Biology and Life Sciences', '#06B6D4', now());

-- Insert teachers
INSERT INTO teachers (id, user_id, school_id, employee_id, qualification, experience_years, subjects, created_at) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'greenwood-teacher-001', '550e8400-e29b-41d4-a716-446655440000', 'T001', 'M.Sc Mathematics', 5, ARRAY['660e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004'], now()),
('770e8400-e29b-41d4-a716-446655440002', 'greenwood-teacher-002', '550e8400-e29b-41d4-a716-446655440000', 'T002', 'M.A English Literature', 8, ARRAY['660e8400-e29b-41d4-a716-446655440002'], now()),
('770e8400-e29b-41d4-a716-446655440003', 'greenwood-teacher-003', '550e8400-e29b-41d4-a716-446655440000', 'T003', 'M.Sc Biology, Ph.D', 12, ARRAY['660e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440005'], now());

-- Insert students
INSERT INTO students (id, user_id, school_id, student_id, class_name, roll_number, date_of_birth, parent_user_id, created_at) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'greenwood-student-001', '550e8400-e29b-41d4-a716-446655440000', 'S001', '10A', '001', '2008-05-15', 'greenwood-parent-001', now()),
('880e8400-e29b-41d4-a716-446655440002', 'greenwood-student-002', '550e8400-e29b-41d4-a716-446655440000', 'S002', '10A', '002', '2008-07-22', 'greenwood-parent-002', now()),
('880e8400-e29b-41d4-a716-446655440003', 'greenwood-student-003', '550e8400-e29b-41d4-a716-446655440000', 'S003', '10A', '003', '2008-03-10', 'greenwood-parent-003', now()),
('880e8400-e29b-41d4-a716-446655440004', 'greenwood-student-004', '550e8400-e29b-41d4-a716-446655440000', 'S004', '10B', '001', '2008-09-18', NULL, now());

-- Insert classes
INSERT INTO classes (id, school_id, teacher_id, subject_id, class_name, name, day_of_week, start_time, end_time, room, is_active, created_at) VALUES
('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '10A', '10A - Mathematics', 'Monday', '09:00', '10:00', 'Room 101', true, now()),
('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '10A', '10A - English', 'Monday', '10:30', '11:30', 'Room 102', true, now()),
('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440006', '10A', '10A - Biology', 'Tuesday', '14:00', '15:00', 'Science Lab', true, now());

-- Insert homework
INSERT INTO homework (id, school_id, teacher_id, subject_id, class_name, title, description, due_date, max_marks, attachments, is_active, created_at) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '10A', 'Quadratic Equations Exercise', 'Complete exercises 1-20 from chapter 4. Show all working steps.', '2025-01-20', 20, ARRAY['math_worksheet.pdf'], true, now()),
('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '10A', 'Romeo and Juliet Essay', 'Write a 500-word essay on the theme of love in Romeo and Juliet.', '2025-01-22', 25, ARRAY[], true, now());

-- Insert exams
INSERT INTO exams (id, school_id, subject_id, class_name, title, exam_date, start_time, end_time, location, max_marks, instructions, status, created_at) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', '10A', 'Mathematics Mid-term Exam', '2025-01-30', '09:00', '12:00', 'Room 101', 100, 'Bring calculator and geometry set', 'upcoming', now()),
('bb0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440002', '10A', 'English Literature Exam', '2025-02-02', '14:00', '17:00', 'Room 102', 100, 'No electronic devices allowed', 'upcoming', now());

-- Insert fees
INSERT INTO fees (id, school_id, student_id, title, description, amount, due_date, status, created_at) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440001', 'Monthly Tuition Fee - January 2025', 'Regular monthly tuition fee', 1200.00, '2025-01-31', 'pending', now()),
('cc0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440001', 'Annual Sports Fee', 'Annual sports and activities fee', 500.00, '2025-01-15', 'paid', now()),
('cc0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440002', 'Laboratory Fee - Semester 2', 'Science laboratory usage fee', 300.00, '2025-02-15', 'pending', now());

-- Insert sample attendance
INSERT INTO attendance (id, school_id, student_id, class_id, date, status, notes, marked_by_user_id, created_at) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', '2025-01-15', 'present', '', 'greenwood-teacher-001', now()),
('dd0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440001', '2025-01-15', 'present', '', 'greenwood-teacher-001', now()),
('dd0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440001', '2025-01-15', 'late', 'Arrived 10 minutes late', 'greenwood-teacher-001', now());

-- Insert sample notifications
INSERT INTO notifications (id, school_id, user_id, title, message, type, data, is_read, created_at) VALUES
('ee0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'greenwood-student-001', 'New Homework Assigned', 'New homework: Quadratic Equations Exercise in Mathematics', 'homework', '{"homework_id": "aa0e8400-e29b-41d4-a716-446655440001", "subject": "Mathematics"}', false, now()),
('ee0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'greenwood-parent-001', 'New Homework Assigned', 'New homework assigned to Alex Thompson: Quadratic Equations Exercise', 'homework', '{"homework_id": "aa0e8400-e29b-41d4-a716-446655440001", "student_name": "Alex Thompson"}', false, now());

-- Insert sample messages
INSERT INTO messages (id, school_id, sender_user_id, receiver_user_id, content, message_type, attachments, is_read, created_at) VALUES
('ff0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'greenwood-parent-001', 'greenwood-teacher-001', 'Hi Ms. Johnson, I wanted to discuss Alex''s progress in mathematics.', 'text', ARRAY[], true, now()),
('ff0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'greenwood-teacher-001', 'greenwood-parent-001', 'Hello! Alex is doing well. Would you like to schedule a meeting?', 'text', ARRAY[], true, now()),
('ff0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'greenwood-parent-001', 'greenwood-teacher-001', 'That would be great. What time works best for you?', 'text', ARRAY[], false, now());