/*
  # Update Database Schema for School ID + User ID Flow

  1. Schema Changes
    - Update users table to use user_id as primary authentication field
    - Add proper constraints and indexes for the new format
    - Update all foreign key relationships
    - Add functions for user ID generation

  2. User ID Format
    - Format: {schoolShortName}-{role}-{serialNo}
    - Examples: greenwood-admin-001, greenwood-teacher-001

  3. Security
    - Enable RLS on all tables
    - Update policies for new authentication flow
    - Ensure proper data isolation by school
*/

-- Drop existing foreign key constraints that reference users.id
ALTER TABLE teachers DROP CONSTRAINT IF EXISTS teachers_user_id_fkey;
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_user_id_fkey;
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_parent_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_marked_by_fkey;

-- Update users table structure
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_id_key;

-- Add new primary key and constraints
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);
ALTER TABLE users ADD CONSTRAINT check_user_id_format CHECK (user_id ~ '^[a-z0-9]+-[a-z]+-[0-9]+$');

-- Update indexes
DROP INDEX IF EXISTS idx_users_user_id;
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- Update teachers table
ALTER TABLE teachers DROP COLUMN IF EXISTS id;
ALTER TABLE teachers ADD COLUMN id uuid DEFAULT gen_random_uuid();
ALTER TABLE teachers DROP CONSTRAINT IF EXISTS teachers_pkey;
ALTER TABLE teachers ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);
ALTER TABLE teachers DROP CONSTRAINT IF EXISTS teachers_user_id_key;
ALTER TABLE teachers ADD CONSTRAINT teachers_user_id_key UNIQUE (user_id);

-- Update students table
ALTER TABLE students DROP COLUMN IF EXISTS id;
ALTER TABLE students ADD COLUMN id uuid DEFAULT gen_random_uuid();
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_pkey;
ALTER TABLE students ADD CONSTRAINT students_pkey PRIMARY KEY (id);
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_user_id_key;
ALTER TABLE students ADD CONSTRAINT students_user_id_key UNIQUE (user_id);

-- Change parent_id to reference user_id instead of users.id
ALTER TABLE students DROP COLUMN IF EXISTS parent_id;
ALTER TABLE students ADD COLUMN parent_user_id text REFERENCES users(user_id);

-- Update messages table to use user_id
ALTER TABLE messages ALTER COLUMN sender_id TYPE text;
ALTER TABLE messages ALTER COLUMN receiver_id TYPE text;

-- Update notifications table to use user_id
ALTER TABLE notifications ALTER COLUMN user_id TYPE text;

-- Update attendance table to use user_id
ALTER TABLE attendance ALTER COLUMN marked_by TYPE text;

-- Re-add foreign key constraints with proper references
ALTER TABLE teachers ADD CONSTRAINT teachers_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE students ADD CONSTRAINT students_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE students ADD CONSTRAINT students_parent_user_id_fkey 
  FOREIGN KEY (parent_user_id) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey 
  FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE messages ADD CONSTRAINT messages_receiver_id_fkey 
  FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE attendance ADD CONSTRAINT attendance_marked_by_fkey 
  FOREIGN KEY (marked_by) REFERENCES users(user_id);

-- Create function to generate sequential user IDs
CREATE OR REPLACE FUNCTION generate_user_id(school_code text, user_role text)
RETURNS text AS $$
DECLARE
    next_serial integer;
    new_user_id text;
BEGIN
    -- Get the next serial number for this school and role
    SELECT COALESCE(MAX(CAST(split_part(user_id, '-', 3) AS integer)), 0) + 1
    INTO next_serial
    FROM users 
    WHERE user_id LIKE school_code || '-' || user_role || '-%';
    
    -- Format the new user ID
    new_user_id := school_code || '-' || user_role || '-' || LPAD(next_serial::text, 3, '0');
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to extract school code from user_id
CREATE OR REPLACE FUNCTION get_school_code_from_user_id(user_id text)
RETURNS text AS $$
BEGIN
    RETURN split_part(user_id, '-', 1);
END;
$$ LANGUAGE plpgsql;

-- Create function to extract role from user_id
CREATE OR REPLACE FUNCTION get_role_from_user_id(user_id text)
RETURNS text AS $$
BEGIN
    RETURN split_part(user_id, '-', 2);
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies to work with new user_id structure

-- Users policies
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can read others in same school" ON users;
DROP POLICY IF EXISTS "Admins can manage users in their school" ON users;

CREATE POLICY "Users can read their own data" ON users
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'user_id' = user_id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'user_id' = user_id);

CREATE POLICY "Users can read others in same school" ON users
  FOR SELECT TO authenticated
  USING (school_id IN (
    SELECT school_id FROM users WHERE user_id = auth.jwt() ->> 'user_id'
  ));

CREATE POLICY "Admins can manage users in their school" ON users
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = auth.jwt() ->> 'user_id' 
    AND role = 'admin' 
    AND school_id = users.school_id
  ));

-- Teachers policies
DROP POLICY IF EXISTS "Teachers can update their own data" ON teachers;
DROP POLICY IF EXISTS "School users can read teachers" ON teachers;
DROP POLICY IF EXISTS "Admins can manage teachers" ON teachers;

CREATE POLICY "Teachers can update their own data" ON teachers
  FOR UPDATE TO authenticated
  USING (user_id = auth.jwt() ->> 'user_id');

CREATE POLICY "School users can read teachers" ON teachers
  FOR SELECT TO authenticated
  USING (school_id IN (
    SELECT school_id FROM users WHERE user_id = auth.jwt() ->> 'user_id'
  ));

CREATE POLICY "Admins can manage teachers" ON teachers
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = auth.jwt() ->> 'user_id' 
    AND role = 'admin' 
    AND school_id = teachers.school_id
  ));

-- Students policies
DROP POLICY IF EXISTS "Students can read their own data" ON students;
DROP POLICY IF EXISTS "Parents can read their children" ON students;
DROP POLICY IF EXISTS "School users can read students" ON students;
DROP POLICY IF EXISTS "Admins can manage students" ON students;

CREATE POLICY "Students can read their own data" ON students
  FOR SELECT TO authenticated
  USING (user_id = auth.jwt() ->> 'user_id');

CREATE POLICY "Parents can read their children" ON students
  FOR SELECT TO authenticated
  USING (parent_user_id = auth.jwt() ->> 'user_id');

CREATE POLICY "School users can read students" ON students
  FOR SELECT TO authenticated
  USING (school_id IN (
    SELECT school_id FROM users WHERE user_id = auth.jwt() ->> 'user_id'
  ));

CREATE POLICY "Admins can manage students" ON students
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = auth.jwt() ->> 'user_id' 
    AND role = 'admin' 
    AND school_id = students.school_id
  ));

-- Messages policies
DROP POLICY IF EXISTS "Users can read their messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their received messages" ON messages;

CREATE POLICY "Users can read their messages" ON messages
  FOR SELECT TO authenticated
  USING (sender_id = auth.jwt() ->> 'user_id' OR receiver_id = auth.jwt() ->> 'user_id');

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.jwt() ->> 'user_id' AND school_id IN (
    SELECT school_id FROM users WHERE user_id = auth.jwt() ->> 'user_id'
  ));

CREATE POLICY "Users can update their received messages" ON messages
  FOR UPDATE TO authenticated
  USING (receiver_id = auth.jwt() ->> 'user_id');

-- Notifications policies
DROP POLICY IF EXISTS "Users can read their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

CREATE POLICY "Users can read their own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.jwt() ->> 'user_id');

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.jwt() ->> 'user_id');

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (school_id IN (
    SELECT school_id FROM users WHERE user_id = auth.jwt() ->> 'user_id'
  ));

-- Fees policies (update to use new student relationship)
DROP POLICY IF EXISTS "Students can read their own fees" ON fees;
DROP POLICY IF EXISTS "Parents can read their children's fees" ON fees;

CREATE POLICY "Students can read their own fees" ON fees
  FOR SELECT TO authenticated
  USING (student_id IN (
    SELECT id FROM students WHERE user_id = auth.jwt() ->> 'user_id'
  ));

CREATE POLICY "Parents can read their children's fees" ON fees
  FOR SELECT TO authenticated
  USING (student_id IN (
    SELECT id FROM students WHERE parent_user_id = auth.jwt() ->> 'user_id'
  ));

-- Homework submissions policies (update to use new student relationship)
DROP POLICY IF EXISTS "Students can manage their submissions" ON homework_submissions;
DROP POLICY IF EXISTS "Parents can read their children's submissions" ON homework_submissions;

CREATE POLICY "Students can manage their submissions" ON homework_submissions
  FOR ALL TO authenticated
  USING (student_id IN (
    SELECT id FROM students WHERE user_id = auth.jwt() ->> 'user_id'
  ));

CREATE POLICY "Parents can read their children's submissions" ON homework_submissions
  FOR SELECT TO authenticated
  USING (student_id IN (
    SELECT id FROM students WHERE parent_user_id = auth.jwt() ->> 'user_id'
  ));

-- Attendance policies (update to use new student relationship)
DROP POLICY IF EXISTS "Students can read their own attendance" ON attendance;
DROP POLICY IF EXISTS "Parents can read their children's attendance" ON attendance;

CREATE POLICY "Students can read their own attendance" ON attendance
  FOR SELECT TO authenticated
  USING (student_id IN (
    SELECT id FROM students WHERE user_id = auth.jwt() ->> 'user_id'
  ));

CREATE POLICY "Parents can read their children's attendance" ON attendance
  FOR SELECT TO authenticated
  USING (student_id IN (
    SELECT id FROM students WHERE parent_user_id = auth.jwt() ->> 'user_id'
  ));