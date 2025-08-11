/*
  # Insert Sample Data for Demo

  1. Sample Data
    - Create a demo school
    - Create sample subjects
    - Create demo users (admin, teachers, parents, students)
    - Link relationships

  This data is for demonstration purposes and can be removed in production.
*/

-- Insert demo school
INSERT INTO schools (id, name, code, region, admin_email, address, phone, website) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Greenwood High School', 'GHS001', 'North District', 'admin@greenwood.edu', '123 Education Street, Learning City', '+1-555-0100', 'https://greenwood.edu')
ON CONFLICT (code) DO NOTHING;

-- Insert sample subjects
INSERT INTO subjects (id, school_id, name, code, description, color) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Mathematics', 'MATH', 'Mathematics and Algebra', '#3B82F6'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'English', 'ENG', 'English Language and Literature', '#10B981'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Science', 'SCI', 'General Science', '#8B5CF6'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Physics', 'PHY', 'Physics and Applied Sciences', '#F59E0B'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Chemistry', 'CHEM', 'Chemistry and Chemical Sciences', '#EF4444'),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'Biology', 'BIO', 'Biology and Life Sciences', '#06B6D4')
ON CONFLICT (school_id, code) DO NOTHING;

-- Insert demo admin user
INSERT INTO users (id, name, email, phone, role, school_id, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Dr. Sarah Wilson', 'admin@greenwood.edu', '+1-555-0100', 'admin', '550e8400-e29b-41d4-a716-446655440000', true)
ON CONFLICT (email) DO NOTHING;

-- Insert demo teachers
INSERT INTO users (id, name, email, phone, role, school_id, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'Sarah Johnson', 'sarah.johnson@greenwood.edu', '+1-555-0101', 'teacher', '550e8400-e29b-41d4-a716-446655440000', true),
('550e8400-e29b-41d4-a716-446655440012', 'Michael Chen', 'michael.chen@greenwood.edu', '+1-555-0102', 'teacher', '550e8400-e29b-41d4-a716-446655440000', true),
('550e8400-e29b-41d4-a716-446655440013', 'Emily Rodriguez', 'emily.rodriguez@greenwood.edu', '+1-555-0103', 'teacher', '550e8400-e29b-41d4-a716-446655440000', true)
ON CONFLICT (email) DO NOTHING;

-- Insert teacher records
INSERT INTO teachers (id, user_id, school_id, employee_id, qualification, experience_years, subjects) VALUES
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'T001', 'M.Sc Mathematics', 5, ARRAY['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004']),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'T002', 'M.A English', 8, ARRAY['550e8400-e29b-41d4-a716-446655440002']),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'T003', 'M.Sc Biology', 6, ARRAY['550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006'])
ON CONFLICT (school_id, employee_id) DO NOTHING;

-- Insert demo parents
INSERT INTO users (id, name, email, phone, role, school_id, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'John Thompson', 'parent1@example.com', '+1-555-0201', 'parent', '550e8400-e29b-41d4-a716-446655440000', true),
('550e8400-e29b-41d4-a716-446655440025', 'Mary Wilson', 'parent2@example.com', '+1-555-0202', 'parent', '550e8400-e29b-41d4-a716-446655440000', true)
ON CONFLICT (email) DO NOTHING;

-- Insert demo students
INSERT INTO users (id, name, email, phone, role, school_id, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440030', 'Alex Thompson', 'alex.thompson@student.greenwood.edu', '+1-555-0301', 'student', '550e8400-e29b-41d4-a716-446655440000', true),
('550e8400-e29b-41d4-a716-446655440031', 'Emma Wilson', 'emma.wilson@student.greenwood.edu', '+1-555-0302', 'student', '550e8400-e29b-41d4-a716-446655440000', true)
ON CONFLICT (email) DO NOTHING;

-- Insert student records
INSERT INTO students (id, user_id, school_id, student_id, class_name, roll_number, date_of_birth, parent_id) VALUES
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440000', 'S001', '10A', '001', '2008-05-15', '550e8400-e29b-41d4-a716-446655440020'),
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440000', 'S002', '10A', '002', '2008-08-22', '550e8400-e29b-41d4-a716-446655440025')
ON CONFLICT (school_id, student_id) DO NOTHING;

-- Insert sample classes
INSERT INTO classes (id, school_id, teacher_id, subject_id, class_name, name, day_of_week, start_time, end_time, room) VALUES
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001', '10A', '10A - Mathematics', 'Monday', '09:00', '10:00', 'Room 101'),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', '10A', '10A - English', 'Monday', '10:30', '11:30', 'Room 102')
ON CONFLICT DO NOTHING;