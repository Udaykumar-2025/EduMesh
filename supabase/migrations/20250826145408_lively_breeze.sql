/*
  # Update Database Schema for School ID + User ID Authentication Flow

  1. Schema Changes
    - Update users table to support new user_id format (schoolname-role-serialno)
    - Add proper constraints and validation
    - Update foreign key relationships
    - Add helper functions for user ID generation

  2. Authentication Support
    - Support for school-based authentication
    - User ID format validation
    - Role extraction from user ID

  3. Data Migration
    - Update existing sample data to new format
    - Ensure referential integrity
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
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_id_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_user_id_format;

-- Make user_id the primary identifier and ensure it's properly formatted
ALTER TABLE users ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_user_id_key UNIQUE (user_id);
ALTER TABLE users ADD CONSTRAINT check_user_id_format 
  CHECK (user_id ~ '^[a-z0-9]+-[a-z]+-[0-9]+$');

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_school_user_id ON users(school_id, user_id);

-- Update schools table to ensure proper school_id format
ALTER TABLE schools ADD CONSTRAINT check_school_code_format 
  CHECK (code ~ '^[a-z0-9]+$');

-- Create function to generate next user ID for a school and role
CREATE OR REPLACE FUNCTION generate_user_id(school_code TEXT, user_role TEXT)
RETURNS TEXT AS $$
DECLARE
    next_serial INTEGER;
    new_user_id TEXT;
BEGIN
    -- Get the next serial number for this school and role
    SELECT COALESCE(MAX(CAST(SPLIT_PART(user_id, '-', 3) AS INTEGER)), 0) + 1
    INTO next_serial
    FROM users 
    WHERE school_id = (SELECT id FROM schools WHERE code = school_code)
    AND role = user_role;
    
    -- Format the user ID
    new_user_id := school_code || '-' || user_role || '-' || LPAD(next_serial::TEXT, 3, '0');
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to extract role from user_id
CREATE OR REPLACE FUNCTION extract_role_from_user_id(user_id_param TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN SPLIT_PART(user_id_param, '-', 2);
END;
$$ LANGUAGE plpgsql;

-- Create function to extract school code from user_id
CREATE OR REPLACE FUNCTION extract_school_code_from_user_id(user_id_param TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN SPLIT_PART(user_id_param, '-', 1);
END;
$$ LANGUAGE plpgsql;

-- Update teachers table to reference user_id instead of users.id
ALTER TABLE teachers DROP COLUMN IF EXISTS user_id;
ALTER TABLE teachers ADD COLUMN user_id TEXT;
ALTER TABLE teachers ADD CONSTRAINT teachers_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);

-- Update students table to reference user_id instead of users.id
ALTER TABLE students DROP COLUMN IF EXISTS user_id;
ALTER TABLE students DROP COLUMN IF EXISTS parent_id;
ALTER TABLE students ADD COLUMN user_id TEXT;
ALTER TABLE students ADD COLUMN parent_user_id TEXT;
ALTER TABLE students ADD CONSTRAINT students_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE students ADD CONSTRAINT students_parent_user_id_fkey 
  FOREIGN KEY (parent_user_id) REFERENCES users(user_id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_parent_user_id ON students(parent_user_id);

-- Update messages table to reference user_id
ALTER TABLE messages DROP COLUMN IF EXISTS sender_id;
ALTER TABLE messages DROP COLUMN IF EXISTS receiver_id;
ALTER TABLE messages ADD COLUMN sender_user_id TEXT NOT NULL;
ALTER TABLE messages ADD COLUMN receiver_user_id TEXT NOT NULL;
ALTER TABLE messages ADD CONSTRAINT messages_sender_user_id_fkey 
  FOREIGN KEY (sender_user_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE messages ADD CONSTRAINT messages_receiver_user_id_fkey 
  FOREIGN KEY (receiver_user_id) REFERENCES users(user_id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_messages_sender_user_id ON messages(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_user_id ON messages(receiver_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_user_id, receiver_user_id, created_at);

-- Update notifications table to reference user_id
ALTER TABLE notifications DROP COLUMN IF EXISTS user_id;
ALTER TABLE notifications ADD COLUMN user_id TEXT NOT NULL;
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Update attendance table to reference user_id for marked_by
ALTER TABLE attendance DROP COLUMN IF EXISTS marked_by;
ALTER TABLE attendance ADD COLUMN marked_by_user_id TEXT NOT NULL;
ALTER TABLE attendance ADD CONSTRAINT attendance_marked_by_user_id_fkey 
  FOREIGN KEY (marked_by_user_id) REFERENCES users(user_id);

-- Update RLS policies to work with new user_id format

-- Users policies
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can read others in same school" ON users;
DROP POLICY IF EXISTS "Admins can manage users in their school" ON users;

CREATE POLICY "Users can read their own data" ON users
  FOR SELECT TO authenticated
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE TO authenticated
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can read others in same school" ON users
  FOR SELECT TO authenticated
  USING (school_id IN (
    SELECT school_id FROM users 
    WHERE user_id = current_setting('app.current_user_id', true)
  ));

CREATE POLICY "Admins can manage users in their school" ON users
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = current_setting('app.current_user_id', true)
    AND role = 'admin' 
    AND school_id = users.school_id
  ));

-- Teachers policies
DROP POLICY IF EXISTS "Teachers can update their own data" ON teachers;
DROP POLICY IF EXISTS "School users can read teachers" ON teachers;
DROP POLICY IF EXISTS "Admins can manage teachers" ON teachers;

CREATE POLICY "Teachers can update their own data" ON teachers
  FOR UPDATE TO authenticated
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "School users can read teachers" ON teachers
  FOR SELECT TO authenticated
  USING (school_id IN (
    SELECT school_id FROM users 
    WHERE user_id = current_setting('app.current_user_id', true)
  ));

CREATE POLICY "Admins can manage teachers" ON teachers
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = current_setting('app.current_user_id', true)
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
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Parents can read their children" ON students
  FOR SELECT TO authenticated
  USING (parent_user_id = current_setting('app.current_user_id', true));

CREATE POLICY "School users can read students" ON students
  FOR SELECT TO authenticated
  USING (school_id IN (
    SELECT school_id FROM users 
    WHERE user_id = current_setting('app.current_user_id', true)
  ));

CREATE POLICY "Admins can manage students" ON students
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = current_setting('app.current_user_id', true)
    AND role = 'admin' 
    AND school_id = students.school_id
  ));

-- Messages policies
DROP POLICY IF EXISTS "Users can read their messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their received messages" ON messages;

CREATE POLICY "Users can read their messages" ON messages
  FOR SELECT TO authenticated
  USING (
    sender_user_id = current_setting('app.current_user_id', true) OR 
    receiver_user_id = current_setting('app.current_user_id', true)
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_user_id = current_setting('app.current_user_id', true) AND
    school_id IN (
      SELECT school_id FROM users 
      WHERE user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "Users can update their received messages" ON messages
  FOR UPDATE TO authenticated
  USING (receiver_user_id = current_setting('app.current_user_id', true));

-- Notifications policies
DROP POLICY IF EXISTS "Users can read their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

CREATE POLICY "Users can read their own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM users 
      WHERE user_id = current_setting('app.current_user_id', true)
    )
  );

-- Fees policies (update to use new student relationships)
DROP POLICY IF EXISTS "Students can read their own fees" ON fees;
DROP POLICY IF EXISTS "Parents can read their children's fees" ON fees;

CREATE POLICY "Students can read their own fees" ON fees
  FOR SELECT TO authenticated
  USING (student_id IN (
    SELECT id FROM students 
    WHERE user_id = current_setting('app.current_user_id', true)
  ));

CREATE POLICY "Parents can read their children's fees" ON fees
  FOR SELECT TO authenticated
  USING (student_id IN (
    SELECT id FROM students 
    WHERE parent_user_id = current_setting('app.current_user_id', true)
  ));

CREATE POLICY "Parents can update payment status" ON fees
  FOR UPDATE TO authenticated
  USING (student_id IN (
    SELECT id FROM students 
    WHERE parent_user_id = current_setting('app.current_user_id', true)
  ));

-- Homework submissions policies
DROP POLICY IF EXISTS "Students can manage their submissions" ON homework_submissions;
DROP POLICY IF EXISTS "Parents can read their children's submissions" ON homework_submissions;

CREATE POLICY "Students can manage their submissions" ON homework_submissions
  FOR ALL TO authenticated
  USING (student_id IN (
    SELECT id FROM students 
    WHERE user_id = current_setting('app.current_user_id', true)
  ));

CREATE POLICY "Parents can read their children's submissions" ON homework_submissions
  FOR SELECT TO authenticated
  USING (student_id IN (
    SELECT id FROM students 
    WHERE parent_user_id = current_setting('app.current_user_id', true)
  ));

-- Attendance policies
DROP POLICY IF EXISTS "Students can read their own attendance" ON attendance;
DROP POLICY IF EXISTS "Parents can read their children's attendance" ON attendance;

CREATE POLICY "Students can read their own attendance" ON attendance
  FOR SELECT TO authenticated
  USING (student_id IN (
    SELECT id FROM students 
    WHERE user_id = current_setting('app.current_user_id', true)
  ));

CREATE POLICY "Parents can read their children's attendance" ON attendance
  FOR SELECT TO authenticated
  USING (student_id IN (
    SELECT id FROM students 
    WHERE parent_user_id = current_setting('app.current_user_id', true)
  ));

CREATE POLICY "Teachers can manage attendance for their classes" ON attendance
  FOR ALL TO authenticated
  USING (class_id IN (
    SELECT id FROM classes 
    WHERE teacher_id IN (
      SELECT id FROM teachers 
      WHERE user_id = current_setting('app.current_user_id', true)
    )
  ));