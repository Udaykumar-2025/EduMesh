/*
  # Create Students Table

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `school_id` (uuid, foreign key to schools)
      - `student_id` (text, unique student identifier)
      - `class_name` (text, class/grade name)
      - `roll_number` (text, roll number in class)
      - `date_of_birth` (date, student's birth date)
      - `parent_id` (uuid, foreign key to users - parent)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `students` table
    - Add policy for school users to read students
    - Add policy for parents to read their children
    - Add policy for students to read their own data
    - Add policy for admins to manage students
*/

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id text NOT NULL,
  class_name text NOT NULL,
  roll_number text NOT NULL,
  date_of_birth date,
  parent_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(school_id, student_id),
  UNIQUE(school_id, class_name, roll_number)
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School users can read students"
  ON students
  FOR SELECT
  TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Parents can read their children"
  ON students
  FOR SELECT
  TO authenticated
  USING (parent_id = auth.uid());

CREATE POLICY "Students can read their own data"
  ON students
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage students"
  ON students
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND school_id = students.school_id
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_parent_id ON students(parent_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(school_id, class_name);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(school_id, student_id);