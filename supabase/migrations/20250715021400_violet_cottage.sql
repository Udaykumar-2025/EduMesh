/*
  # Demo Data for EduMesh

  1. Demo School Setup
    - Create demo school
    - Add demo users for all roles
    - Create subjects and classes
    - Add sample homework and exams

  2. Realistic Data
    - Multiple teachers with different subjects
    - Students with parent relationships
    - Scheduled classes and homework
    - Sample attendance and fees
*/

-- Insert demo school
INSERT INTO schools (id, name, code, region, admin_email, address, phone, website) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Greenwood High School', 'GHS001', 'North District', 'admin@greenwood.edu', '123 Education Street, Learning City', '+1-555-0123', 'https://greenwood.edu')
ON CONFLICT (code) DO NOTHING;

-- Insert demo subjects
INSERT INTO subjects (id, name, code, school_id, description, color) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Mathematics', 'MATH', '550e8400-e29b-41d4-a716-446655440000', 'Core mathematics curriculum', '#3B82F6'),
('550e8400-e29b-41d4-a716-446655440002', 'English Literature', 'ENG', '550e8400-e29b-41d4-a716-446655440000', 'English language and literature', '#10B981'),
('550e8400-e29b-41d4-a716-446655440003', 'Biology', 'BIO', '550e8400-e29b-41d4-a716-446655440000', 'Life sciences and biology', '#8B5CF6'),
('550e8400-e29b-41d4-a716-446655440004', 'Physics', 'PHY', '550e8400-e29b-41d4-a716-446655440000', 'Physics and physical sciences', '#F59E0B'),
('550e8400-e29b-41d4-a716-446655440005', 'Chemistry', 'CHEM', '550e8400-e29b-41d4-a716-446655440000', 'Chemistry and chemical sciences', '#EF4444')
ON CONFLICT (school_id, code) DO NOTHING;

-- Insert demo users
INSERT INTO users (id, email, phone, name, role, school_id, avatar_url) VALUES
-- Admin
('550e8400-e29b-41d4-a716-446655440010', 'admin@greenwood.edu', '+1-555-0100', 'Dr. Sarah Wilson', 'admin', '550e8400-e29b-41d4-a716-446655440000', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=150'),

-- Teachers
('550e8400-e29b-41d4-a716-446655440011', 'sarah.johnson@greenwood.edu', '+1-555-0101', 'Sarah Johnson', 'teacher', '550e8400-e29b-41d4-a716-446655440000', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=150'),
('550e8400-e29b-41d4-a716-446655440012', 'michael.chen@greenwood.edu', '+1-555-0102', 'Michael Chen', 'teacher', '550e8400-e29b-41d4-a716-446655440000', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=150'),
('550e8400-e29b-41d4-a716-446655440013', 'emily.rodriguez@greenwood.edu', '+1-555-0103', 'Emily Rodriguez', 'teacher', '550e8400-e29b-41d4-a716-446655440000', 'https://images.pexels.com/photos/3755755/pexels-photo-3755755.jpeg?w=150'),

-- Parents
('550e8400-e29b-41d4-a716-446655440020', 'parent1@example.com', '+1-555-0201', 'John Thompson', 'parent', '550e8400-e29b-41d4-a716-446655440000', 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?w=150'),
('550e8400-e29b-41d4-a716-446655440021', 'parent2@example.com', '+1-555-0202', 'Lisa Wilson', 'parent', '550e8400-e29b-41d4-a716-446655440000', 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?w=150'),
('550e8400-e29b-41d4-a716-446655440022', 'parent3@example.com', '+1-555-0203', 'David Davis', 'parent', '550e8400-e29b-41d4-a716-446655440000', 'https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?w=150'),

-- Students
('550e8400-e29b-41d4-a716-446655440030', 'alex.thompson@student.greenwood.edu', '+1-555-0301', 'Alex Thompson', 'student', '550e8400-e29b-41d4-a716-446655440000', 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?w=150'),
('550e8400-e29b-41d4-a716-446655440031', 'emma.wilson@student.greenwood.edu', '+1-555-0302', 'Emma Wilson', 'student', '550e8400-e29b-41d4-a716-446655440000', 'https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?w=150'),
('550e8400-e29b-41d4-a716-446655440032', 'james.davis@student.greenwood.edu', '+1-555-0303', 'James Davis', 'student', '550e8400-e29b-41d4-a716-446655440000', 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?w=150')
ON CONFLICT (email) DO NOTHING;

-- Insert teachers
INSERT INTO teachers (id, user_id, school_id, employee_id, qualification, experience_years, subjects) VALUES
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'T001', 'M.Sc Mathematics', 8, ARRAY['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004']),
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'T002', 'M.A English Literature', 6, ARRAY['550e8400-e29b-41d4-a716-446655440002']),
('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'T003', 'M.Sc Biology', 5, ARRAY['550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005'])
ON CONFLICT (school_id, employee_id) DO NOTHING;

-- Insert students
INSERT INTO students (id, user_id, school_id, student_id, class_name, roll_number, parent_id, date_of_birth) VALUES
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440000', 'S001', '10A', '001', '550e8400-e29b-41d4-a716-446655440020', '2008-05-15'),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440000', 'S002', '10A', '002', '550e8400-e29b-41d4-a716-446655440021', '2008-08-22'),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440000', 'S003', '10A', '003', '550e8400-e29b-41d4-a716-446655440022', '2008-03-10')
ON CONFLICT (school_id, student_id) DO NOTHING;

-- Insert classes
INSERT INTO classes (id, school_id, name, subject_id, teacher_id, class_name, day_of_week, start_time, end_time, room) VALUES
('550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440000', '10A Mathematics', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440040', '10A', 1, '09:00', '10:00', 'Room 101'),
('550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440000', '10A English', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440041', '10A', 1, '10:30', '11:30', 'Room 102'),
('550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440000', '10A Biology', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440042', '10A', 1, '14:00', '15:00', 'Science Lab'),
('550e8400-e29b-41d4-a716-446655440063', '550e8400-e29b-41d4-a716-446655440000', '10A Physics', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440040', '10A', 2, '09:00', '10:00', 'Physics Lab'),
('550e8400-e29b-41d4-a716-446655440064', '550e8400-e29b-41d4-a716-446655440000', '10A Chemistry', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440042', '10A', 3, '11:00', '12:00', 'Chemistry Lab');

-- Insert homework
INSERT INTO homework (id, school_id, teacher_id, subject_id, class_name, title, description, due_date, max_marks) VALUES
('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440001', '10A', 'Quadratic Equations Exercise', 'Complete exercises 1-20 from chapter 4. Show all working steps clearly.', '2025-01-20', 20),
('550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440002', '10A', 'Romeo and Juliet Essay', 'Write a 500-word essay on the theme of love in Romeo and Juliet.', '2025-01-22', 25),
('550e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440003', '10A', 'Cell Structure Diagram', 'Draw and label detailed diagrams of plant and animal cells.', '2025-01-25', 15);

-- Insert exams
INSERT INTO exams (id, school_id, subject_id, class_name, title, exam_date, start_time, end_time, location, max_marks) VALUES
('550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '10A', 'Mathematics Mid-term Exam', '2025-01-30', '09:00', '12:00', 'Room 101', 100),
('550e8400-e29b-41d4-a716-446655440081', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', '10A', 'English Literature Exam', '2025-02-02', '14:00', '17:00', 'Room 102', 100),
('550e8400-e29b-41d4-a716-446655440082', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', '10A', 'Biology Practical Exam', '2025-02-05', '10:00', '13:00', 'Science Lab', 50);

-- Insert sample attendance
INSERT INTO attendance (school_id, student_id, class_id, date, status, marked_by) VALUES
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440060', '2025-01-15', 'present', '550e8400-e29b-41d4-a716-446655440011'),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440060', '2025-01-15', 'present', '550e8400-e29b-41d4-a716-446655440011'),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440060', '2025-01-15', 'late', '550e8400-e29b-41d4-a716-446655440011')
ON CONFLICT (student_id, class_id, date) DO NOTHING;

-- Insert sample fees
INSERT INTO fees (school_id, student_id, title, description, amount, due_date, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440050', 'Monthly Tuition Fee', 'January 2025 tuition fee', 1200.00, '2025-01-31', 'pending'),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440050', 'Annual Sports Fee', 'Sports activities and equipment fee', 500.00, '2025-01-15', 'paid'),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440050', 'Laboratory Fee', 'Science laboratory usage fee', 300.00, '2025-02-15', 'pending');

-- Insert sample messages
INSERT INTO messages (sender_id, receiver_id, school_id, content, message_type) VALUES
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Hi Ms. Johnson, I wanted to discuss Alex''s progress in mathematics.', 'text'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', 'Hello! Alex is doing well. Would you like to schedule a meeting?', 'text'),
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'That would be great. What time works best for you?', 'text');

-- Insert sample notifications
INSERT INTO notifications (user_id, school_id, title, message, type) VALUES
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', 'New Homework Assigned', 'Alex has been assigned new homework in Mathematics', 'homework'),
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', 'Exam Scheduled', 'Mathematics Mid-term Exam scheduled for January 30th', 'exam'),
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440000', 'Assignment Due Soon', 'Your Quadratic Equations homework is due in 2 days', 'homework');