/*
  # Insert Updated Sample Data with New User ID Format

  1. Sample School
    - Greenwood High School with code 'greenwood'

  2. Sample Users
    - Admin: greenwood-admin-001
    - Teachers: greenwood-teacher-001, greenwood-teacher-002
    - Parents: greenwood-parent-001, greenwood-parent-002
    - Students: greenwood-student-001, greenwood-student-002

  3. Complete Data Set
    - All tables populated with proper relationships
    - Realistic sample data for testing
*/

-- Clear existing data
TRUNCATE TABLE homework_submissions CASCADE;
TRUNCATE TABLE attendance CASCADE;
TRUNCATE TABLE homework CASCADE;
TRUNCATE TABLE exams CASCADE;
TRUNCATE TABLE fees CASCADE;
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE classes CASCADE;
TRUNCATE TABLE students CASCADE;
TRUNCATE TABLE teachers CASCADE;
TRUNCATE TABLE subjects CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE schools CASCADE;

-- Insert sample school
INSERT INTO schools (id, name, code, region, admin_email, address, phone, website) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Greenwood High School', 'greenwood', 'Downtown District', 'admin@greenwood.edu', '123 Education Street, Learning City, LC 12345', '+1-555-0100', 'https://greenwood.edu');

-- Insert sample users with new user_id format
INSERT INTO users (user_id, name, email, phone, role, school_id, is_active) VALUES
-- Admin
('greenwood-admin-001', 'Dr. Sarah Mitchell', 'admin@greenwood.edu', '+1-555-0101', 'admin', '550e8400-e29b-41d4-a716-446655440000', true),

-- Teachers
('greenwood-teacher-001', 'Prof. Michael Johnson', 'michael.johnson@greenwood.edu', '+1-555-0102', 'teacher', '550e8400-e29b-41d4-a716-446655440000', true),
('greenwood-teacher-002', 'Ms. Emily Rodriguez', 'emily.rodriguez@greenwood.edu', '+1-555-0103', 'teacher', '550e8400-e29b-41d4-a716-446655440000', true),
('greenwood-teacher-003', 'Dr. James Wilson', 'james.wilson@greenwood.edu', '+1-555-0104', 'teacher', '550e8400-e29b-41d4-a716-446655440000', true),

-- Parents
('greenwood-parent-001', 'Jennifer Thompson', 'jennifer.thompson@email.com', '+1-555-0201', 'parent', '550e8400-e29b-41d4-a716-446655440000', true),
('greenwood-parent-002', 'David Chen', 'david.chen@email.com', '+1-555-0202', 'parent', '550e8400-e29b-41d4-a716-446655440000', true),
('greenwood-parent-003', 'Maria Garcia', 'maria.garcia@email.com', '+1-555-0203', 'parent', '550e8400-e29b-41d4-a716-446655440000', true),

-- Students
('greenwood-student-001', 'Alex Thompson', 'alex.thompson@student.greenwood.edu', '+1-555-0301', 'student', '550e8400-e29b-41d4-a716-446655440000', true),
('greenwood-student-002', 'Emma Chen', 'emma.chen@student.greenwood.edu', '+1-555-0302', 'student', '550e8400-e29b-41d4-a716-446655440000', true),
('greenwood-student-003', 'Lucas Garcia', 'lucas.garcia@student.greenwood.edu', '+1-555-0303', 'student', '550e8400-e29b-41d4-a716-446655440000', true),
('greenwood-student-004', 'Sophie Wilson', 'sophie.wilson@student.greenwood.edu', '+1-555-0304', 'student', '550e8400-e29b-41d4-a716-446655440000', true);

-- Insert subjects
INSERT INTO subjects (id, school_id, name, code, description, color) VALUES
('sub-001', '550e8400-e29b-41d4-a716-446655440000', 'Mathematics', 'MATH', 'Advanced Mathematics and Algebra', '#3B82F6'),
('sub-002', '550e8400-e29b-41d4-a716-446655440000', 'English Literature', 'ENG', 'English Language and Literature', '#10B981'),
('sub-003', '550e8400-e29b-41d4-a716-446655440000', 'Physics', 'PHY', 'Physics and Applied Sciences', '#8B5CF6'),
('sub-004', '550e8400-e29b-41d4-a716-446655440000', 'Chemistry', 'CHEM', 'Chemistry and Laboratory Sciences', '#F59E0B'),
('sub-005', '550e8400-e29b-41d4-a716-446655440000', 'Biology', 'BIO', 'Biology and Life Sciences', '#EF4444'),
('sub-006', '550e8400-e29b-41d4-a716-446655440000', 'History', 'HIST', 'World History and Social Studies', '#6B7280');

-- Insert teachers
INSERT INTO teachers (id, user_id, school_id, employee_id, qualification, experience_years, subjects) VALUES
('teacher-001', 'greenwood-teacher-001', '550e8400-e29b-41d4-a716-446655440000', 'T001', 'M.Sc Mathematics, B.Ed', 8, ARRAY['sub-001', 'sub-003']),
('teacher-002', 'greenwood-teacher-002', '550e8400-e29b-41d4-a716-446655440000', 'T002', 'M.A English Literature, B.Ed', 6, ARRAY['sub-002']),
('teacher-003', 'greenwood-teacher-003', '550e8400-e29b-41d4-a716-446655440000', 'T003', 'Ph.D Chemistry, M.Sc Physics', 12, ARRAY['sub-003', 'sub-004', 'sub-005']);

-- Insert students
INSERT INTO students (id, user_id, school_id, student_id, class_name, roll_number, date_of_birth, parent_user_id) VALUES
('student-001', 'greenwood-student-001', '550e8400-e29b-41d4-a716-446655440000', 'S001', '10A', '001', '2008-05-15', 'greenwood-parent-001'),
('student-002', 'greenwood-student-002', '550e8400-e29b-41d4-a716-446655440000', 'S002', '10A', '002', '2008-07-22', 'greenwood-parent-002'),
('student-003', 'greenwood-student-003', '550e8400-e29b-41d4-a716-446655440000', 'S003', '10B', '001', '2008-03-10', 'greenwood-parent-003'),
('student-004', 'greenwood-student-004', '550e8400-e29b-41d4-a716-446655440000', 'S004', '10B', '002', '2008-09-18', 'greenwood-parent-001');

-- Insert classes
INSERT INTO classes (id, school_id, teacher_id, subject_id, class_name, name, day_of_week, start_time, end_time, room) VALUES
('class-001', '550e8400-e29b-41d4-a716-446655440000', 'teacher-001', 'sub-001', '10A', 'Mathematics - 10A', 'Monday', '09:00', '10:00', 'Room 101'),
('class-002', '550e8400-e29b-41d4-a716-446655440000', 'teacher-002', 'sub-002', '10A', 'English Literature - 10A', 'Monday', '10:30', '11:30', 'Room 102'),
('class-003', '550e8400-e29b-41d4-a716-446655440000', 'teacher-003', 'sub-003', '10A', 'Physics - 10A', 'Tuesday', '09:00', '10:00', 'Lab 201'),
('class-004', '550e8400-e29b-41d4-a716-446655440000', 'teacher-001', 'sub-001', '10B', 'Mathematics - 10B', 'Wednesday', '14:00', '15:00', 'Room 101'),
('class-005', '550e8400-e29b-41d4-a716-446655440000', 'teacher-003', 'sub-004', '10B', 'Chemistry - 10B', 'Thursday', '10:30', '11:30', 'Lab 202');

-- Insert homework
INSERT INTO homework (id, school_id, teacher_id, subject_id, class_name, title, description, due_date, max_marks) VALUES
('hw-001', '550e8400-e29b-41d4-a716-446655440000', 'teacher-001', 'sub-001', '10A', 'Quadratic Equations', 'Solve problems 1-20 from Chapter 4. Show all working steps clearly.', '2025-01-25', 50),
('hw-002', '550e8400-e29b-41d4-a716-446655440000', 'teacher-002', 'sub-002', '10A', 'Shakespeare Essay', 'Write a 500-word essay on themes in Romeo and Juliet.', '2025-01-28', 100),
('hw-003', '550e8400-e29b-41d4-a716-446655440000', 'teacher-003', 'sub-003', '10A', 'Motion and Forces', 'Complete the lab report on projectile motion experiment.', '2025-01-30', 75);

-- Insert exams
INSERT INTO exams (id, school_id, subject_id, class_name, title, exam_date, start_time, end_time, location, max_marks, status) VALUES
('exam-001', '550e8400-e29b-41d4-a716-446655440000', 'sub-001', '10A', 'Mathematics Mid-term', '2025-02-15', '09:00', '12:00', 'Main Hall', 100, 'upcoming'),
('exam-002', '550e8400-e29b-41d4-a716-446655440000', 'sub-002', '10A', 'English Literature Test', '2025-02-18', '14:00', '16:00', 'Room 102', 80, 'upcoming'),
('exam-003', '550e8400-e29b-41d4-a716-446655440000', 'sub-003', '10A', 'Physics Practical', '2025-02-20', '10:00', '13:00', 'Lab 201', 50, 'upcoming');

-- Insert fees
INSERT INTO fees (id, school_id, student_id, title, description, amount, due_date, status) VALUES
('fee-001', '550e8400-e29b-41d4-a716-446655440000', 'student-001', 'Tuition Fee - January', 'Monthly tuition fee for January 2025', 1200.00, '2025-01-31', 'pending'),
('fee-002', '550e8400-e29b-41d4-a716-446655440000', 'student-001', 'Laboratory Fee', 'Science laboratory usage fee', 150.00, '2025-02-15', 'pending'),
('fee-003', '550e8400-e29b-41d4-a716-446655440000', 'student-002', 'Tuition Fee - January', 'Monthly tuition fee for January 2025', 1200.00, '2025-01-31', 'paid'),
('fee-004', '550e8400-e29b-41d4-a716-446655440000', 'student-002', 'Sports Fee', 'Annual sports activities fee', 200.00, '2025-03-01', 'pending');

-- Insert sample messages
INSERT INTO messages (id, school_id, sender_id, receiver_id, content, message_type) VALUES
('msg-001', '550e8400-e29b-41d4-a716-446655440000', 'greenwood-parent-001', 'greenwood-teacher-001', 'Hello, I wanted to discuss Alex''s progress in mathematics.', 'text'),
('msg-002', '550e8400-e29b-41d4-a716-446655440000', 'greenwood-teacher-001', 'greenwood-parent-001', 'Hi Jennifer! Alex is doing well. Would you like to schedule a meeting?', 'text'),
('msg-003', '550e8400-e29b-41d4-a716-446655440000', 'greenwood-admin-001', 'greenwood-teacher-002', 'Please submit your lesson plans for next week.', 'text');

-- Insert sample notifications
INSERT INTO notifications (id, school_id, user_id, title, message, type, data) VALUES
('notif-001', '550e8400-e29b-41d4-a716-446655440000', 'greenwood-student-001', 'New Homework Assigned', 'Mathematics homework due on January 25th', 'homework', '{"homework_id": "hw-001"}'),
('notif-002', '550e8400-e29b-41d4-a716-446655440000', 'greenwood-parent-001', 'Fee Payment Due', 'Tuition fee payment is due on January 31st', 'fee', '{"fee_id": "fee-001"}'),
('notif-003', '550e8400-e29b-41d4-a716-446655440000', 'greenwood-student-002', 'Exam Schedule', 'Mathematics mid-term exam on February 15th', 'exam', '{"exam_id": "exam-001"}');

-- Insert sample attendance
INSERT INTO attendance (id, school_id, student_id, class_id, date, status, marked_by) VALUES
('att-001', '550e8400-e29b-41d4-a716-446655440000', 'student-001', 'class-001', '2025-01-15', 'present', 'greenwood-teacher-001'),
('att-002', '550e8400-e29b-41d4-a716-446655440000', 'student-002', 'class-001', '2025-01-15', 'present', 'greenwood-teacher-001'),
('att-003', '550e8400-e29b-41d4-a716-446655440000', 'student-001', 'class-002', '2025-01-15', 'late', 'greenwood-teacher-002'),
('att-004', '550e8400-e29b-41d4-a716-446655440000', 'student-002', 'class-002', '2025-01-15', 'present', 'greenwood-teacher-002');

-- Insert sample homework submissions
INSERT INTO homework_submissions (id, homework_id, student_id, notes, status, submitted_at) VALUES
('sub-001', 'hw-001', 'student-001', 'Completed all problems with detailed solutions.', 'submitted', '2025-01-20 14:30:00+00'),
('sub-002', 'hw-002', 'student-002', 'Essay on Romeo and Juliet themes completed.', 'submitted', '2025-01-22 16:45:00+00');