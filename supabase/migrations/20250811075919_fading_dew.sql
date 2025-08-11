/*
  # Create Classes Table

  1. New Tables
    - `classes`
      - `id` (uuid, primary key)
      - `school_id` (uuid, foreign key to schools)
      - `teacher_id` (uuid, foreign key to teachers)
      - `subject_id` (uuid, foreign key to subjects)
      - `class_name` (text, class/grade name)
      - `name` (text, class display name)
      - `day_of_week` (text, day of the week)
      - `start_time` (time, class start time)
      - `end_time` (time, class end time)
      - `room` (text, classroom/location)
      - `is_active` (boolean, class status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `classes` table
    - Add policy for school users to read classes
    - Add policy for teachers to manage their classes
    - Add policy for admins to manage all classes
*/

CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_name text NOT NULL,
  name text NOT NULL,
  day_of_week text NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  start_time time NOT NULL,
  end_time time NOT NULL,
  room text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School users can read classes"
  ON classes
  FOR SELECT
  TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage their classes"
  ON classes
  FOR ALL
  TO authenticated
  USING (
    teacher_id IN (
      SELECT id FROM teachers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all classes"
  ON classes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND school_id = classes.school_id
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_subject_id ON classes(subject_id);
CREATE INDEX IF NOT EXISTS idx_classes_schedule ON classes(school_id, day_of_week, start_time);