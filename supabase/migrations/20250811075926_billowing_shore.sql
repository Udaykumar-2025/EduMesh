/*
  # Create Homework Table

  1. New Tables
    - `homework`
      - `id` (uuid, primary key)
      - `school_id` (uuid, foreign key to schools)
      - `teacher_id` (uuid, foreign key to teachers)
      - `subject_id` (uuid, foreign key to subjects)
      - `class_name` (text, target class)
      - `title` (text, homework title)
      - `description` (text, homework description)
      - `due_date` (date, submission deadline)
      - `max_marks` (integer, maximum marks)
      - `attachments` (text array, file URLs)
      - `is_active` (boolean, homework status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `homework` table
    - Add policies for different user roles
*/

CREATE TABLE IF NOT EXISTS homework (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_name text NOT NULL,
  title text NOT NULL,
  description text,
  due_date date NOT NULL,
  max_marks integer DEFAULT 0,
  attachments text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE homework ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School users can read homework"
  ON homework
  FOR SELECT
  TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage their homework"
  ON homework
  FOR ALL
  TO authenticated
  USING (
    teacher_id IN (
      SELECT id FROM teachers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all homework"
  ON homework
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND school_id = homework.school_id
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_homework_school_id ON homework(school_id);
CREATE INDEX IF NOT EXISTS idx_homework_teacher_id ON homework(teacher_id);
CREATE INDEX IF NOT EXISTS idx_homework_subject_id ON homework(subject_id);
CREATE INDEX IF NOT EXISTS idx_homework_class ON homework(school_id, class_name);
CREATE INDEX IF NOT EXISTS idx_homework_due_date ON homework(due_date);