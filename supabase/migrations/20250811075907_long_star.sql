/*
  # Create Teachers Table

  1. New Tables
    - `teachers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `school_id` (uuid, foreign key to schools)
      - `employee_id` (text, unique employee identifier)
      - `qualification` (text, teacher qualifications)
      - `experience_years` (integer, years of experience)
      - `subjects` (text array, subject IDs they teach)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `teachers` table
    - Add policy for school users to read teachers
    - Add policy for teachers to update their own data
    - Add policy for admins to manage teachers
*/

CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  employee_id text NOT NULL,
  qualification text,
  experience_years integer DEFAULT 0,
  subjects text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(school_id, employee_id)
);

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School users can read teachers"
  ON teachers
  FOR SELECT
  TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update their own data"
  ON teachers
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage teachers"
  ON teachers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND school_id = teachers.school_id
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_school_id ON teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_employee_id ON teachers(school_id, employee_id);