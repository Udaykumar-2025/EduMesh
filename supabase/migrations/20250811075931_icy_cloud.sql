/*
  # Create Homework Submissions Table

  1. New Tables
    - `homework_submissions`
      - `id` (uuid, primary key)
      - `homework_id` (uuid, foreign key to homework)
      - `student_id` (uuid, foreign key to students)
      - `notes` (text, submission notes)
      - `attachments` (text array, submitted files)
      - `status` (text, submission status)
      - `marks_obtained` (integer, marks received)
      - `feedback` (text, teacher feedback)
      - `submitted_at` (timestamp, submission time)
      - `graded_at` (timestamp, grading time)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `homework_submissions` table
    - Add policies for students, teachers, and parents
*/

CREATE TABLE IF NOT EXISTS homework_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  homework_id uuid NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  notes text,
  attachments text[] DEFAULT '{}',
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'late', 'graded')),
  marks_obtained integer,
  feedback text,
  submitted_at timestamptz DEFAULT now(),
  graded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(homework_id, student_id)
);

ALTER TABLE homework_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage their submissions"
  ON homework_submissions
  FOR ALL
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can read their children's submissions"
  ON homework_submissions
  FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can read and grade submissions"
  ON homework_submissions
  FOR ALL
  TO authenticated
  USING (
    homework_id IN (
      SELECT id FROM homework 
      WHERE teacher_id IN (
        SELECT id FROM teachers WHERE user_id = auth.uid()
      )
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_homework_submissions_homework_id ON homework_submissions(homework_id);
CREATE INDEX IF NOT EXISTS idx_homework_submissions_student_id ON homework_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_homework_submissions_status ON homework_submissions(status);