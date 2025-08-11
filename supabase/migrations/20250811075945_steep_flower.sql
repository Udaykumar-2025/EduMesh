/*
  # Create Exams Table

  1. New Tables
    - `exams`
      - `id` (uuid, primary key)
      - `school_id` (uuid, foreign key to schools)
      - `subject_id` (uuid, foreign key to subjects)
      - `class_name` (text, target class)
      - `title` (text, exam title)
      - `exam_date` (date, exam date)
      - `start_time` (time, exam start time)
      - `end_time` (time, exam end time)
      - `location` (text, exam location)
      - `max_marks` (integer, maximum marks)
      - `instructions` (text, exam instructions)
      - `status` (text, exam status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `exams` table
    - Add policies for different user roles
*/

CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_name text NOT NULL,
  title text NOT NULL,
  exam_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  location text,
  max_marks integer DEFAULT 100,
  instructions text,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School users can read exams"
  ON exams
  FOR SELECT
  TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage exams for their subjects"
  ON exams
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE u.id = auth.uid()
      AND t.school_id = exams.school_id
      AND exams.subject_id = ANY(t.subjects::uuid[])
    )
  );

CREATE POLICY "Admins can manage all exams"
  ON exams
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND school_id = exams.school_id
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_exams_school_id ON exams(school_id);
CREATE INDEX IF NOT EXISTS idx_exams_subject_id ON exams(subject_id);
CREATE INDEX IF NOT EXISTS idx_exams_class ON exams(school_id, class_name);
CREATE INDEX IF NOT EXISTS idx_exams_date ON exams(exam_date);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);