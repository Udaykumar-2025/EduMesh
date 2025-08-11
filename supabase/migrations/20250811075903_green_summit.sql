/*
  # Create Subjects Table

  1. New Tables
    - `subjects`
      - `id` (uuid, primary key)
      - `school_id` (uuid, foreign key to schools)
      - `name` (text, subject name)
      - `code` (text, subject code)
      - `description` (text, subject description)
      - `color` (text, hex color for UI)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `subjects` table
    - Add policy for school users to read subjects
    - Add policy for admins to manage subjects
*/

CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  description text,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(school_id, code)
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School users can read subjects"
  ON subjects
  FOR SELECT
  TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage subjects"
  ON subjects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND school_id = subjects.school_id
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subjects_school_id ON subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects(school_id, code);