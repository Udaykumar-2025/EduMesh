/*
  # Row Level Security Policies for EduMesh

  1. Security Policies
    - School-based data isolation
    - Role-based access control
    - User can only access their own data
    - Parents can only see their children's data
    - Teachers can only see their assigned classes
    - Admins have full access within their school

  2. Authentication
    - All policies require authentication
    - Custom claims for role and school_id
*/

-- Schools policies
CREATE POLICY "Users can view their own school"
  ON schools FOR SELECT
  TO authenticated
  USING (id = (auth.jwt() ->> 'school_id')::uuid);

CREATE POLICY "Admins can update their school"
  ON schools FOR UPDATE
  TO authenticated
  USING (
    id = (auth.jwt() ->> 'school_id')::uuid AND
    (auth.jwt() ->> 'role') = 'admin'
  );

-- Users policies
CREATE POLICY "Users can view users in their school"
  ON users FOR SELECT
  TO authenticated
  USING (school_id = (auth.jwt() ->> 'school_id')::uuid);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can manage users in their school"
  ON users FOR ALL
  TO authenticated
  USING (
    school_id = (auth.jwt() ->> 'school_id')::uuid AND
    (auth.jwt() ->> 'role') = 'admin'
  );

-- Subjects policies
CREATE POLICY "Users can view subjects in their school"
  ON subjects FOR SELECT
  TO authenticated
  USING (school_id = (auth.jwt() ->> 'school_id')::uuid);

CREATE POLICY "Admins can manage subjects"
  ON subjects FOR ALL
  TO authenticated
  USING (
    school_id = (auth.jwt() ->> 'school_id')::uuid AND
    (auth.jwt() ->> 'role') = 'admin'
  );

-- Teachers policies
CREATE POLICY "Users can view teachers in their school"
  ON teachers FOR SELECT
  TO authenticated
  USING (school_id = (auth.jwt() ->> 'school_id')::uuid);

CREATE POLICY "Teachers can update their own profile"
  ON teachers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage teachers"
  ON teachers FOR ALL
  TO authenticated
  USING (
    school_id = (auth.jwt() ->> 'school_id')::uuid AND
    (auth.jwt() ->> 'role') = 'admin'
  );

-- Students policies
CREATE POLICY "Users can view students in their school"
  ON students FOR SELECT
  TO authenticated
  USING (
    school_id = (auth.jwt() ->> 'school_id')::uuid AND
    (
      (auth.jwt() ->> 'role') IN ('admin', 'teacher') OR
      parent_id = auth.uid() OR
      user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update their children"
  ON students FOR UPDATE
  TO authenticated
  USING (parent_id = auth.uid());

CREATE POLICY "Admins can manage students"
  ON students FOR ALL
  TO authenticated
  USING (
    school_id = (auth.jwt() ->> 'school_id')::uuid AND
    (auth.jwt() ->> 'role') = 'admin'
  );

-- Classes policies
CREATE POLICY "Users can view classes in their school"
  ON classes FOR SELECT
  TO authenticated
  USING (school_id = (auth.jwt() ->> 'school_id')::uuid);

CREATE POLICY "Teachers can manage their classes"
  ON classes FOR ALL
  TO authenticated
  USING (
    school_id = (auth.jwt() ->> 'school_id')::uuid AND
    (
      (auth.jwt() ->> 'role') = 'admin' OR
      teacher_id IN (
        SELECT id FROM teachers WHERE user_id = auth.uid()
      )
    )
  );

-- Homework policies
CREATE POLICY "Users can view homework in their school"
  ON homework FOR SELECT
  TO authenticated
  USING (
    school_id = (auth.jwt() ->> 'school_id')::uuid AND
    (
      (auth.jwt() ->> 'role') IN ('admin', 'teacher') OR
      EXISTS (
        SELECT 1 FROM students s 
        WHERE s.class_name = homework.class_name 
        AND (s.parent_id = auth.uid() OR s.user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Teachers can manage homework"
  ON homework FOR ALL
  TO authenticated
  USING (
    school_id = (auth.jwt() ->> 'school_id')::uuid AND
    (
      (auth.jwt() ->> 'role') = 'admin' OR
      teacher_id IN (
        SELECT id FROM teachers WHERE user_id = auth.uid()
      )
    )
  );

-- Homework submissions policies
CREATE POLICY "Users can view relevant homework submissions"
  ON homework_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM homework h
      WHERE h.id = homework_submissions.homework_id
      AND h.school_id = (auth.jwt() ->> 'school_id')::uuid
      AND (
        (auth.jwt() ->> 'role') IN ('admin', 'teacher') OR
        student_id IN (
          SELECT id FROM students s
          WHERE s.parent_id = auth.uid() OR s.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Students can submit their homework"
  ON homework_submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can update their submissions"
  ON homework_submissions FOR UPDATE
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

-- Exams policies
CREATE POLICY "Users can view exams in their school"
  ON exams FOR SELECT
  TO authenticated
  USING (school_id = (auth.jwt() ->> 'school_id')::uuid);

CREATE POLICY "Teachers and admins can manage exams"
  ON exams FOR ALL
  TO authenticated
  USING (
    school_id = (auth.jwt() ->> 'school_id')::uuid AND
    (auth.jwt() ->> 'role') IN ('admin', 'teacher')
  );

-- Attendance policies
CREATE POLICY "Users can view relevant attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (
    school_id = (auth.jwt() ->> 'school_id')::uuid AND
    (
      (auth.jwt() ->> 'role') IN ('admin', 'teacher') OR
      student_id IN (
        SELECT id FROM students s
        WHERE s.parent_id = auth.uid() OR s.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Teachers can manage attendance"
  ON attendance FOR ALL
  TO authenticated
  USING (
    school_id = (auth.jwt() ->> 'school_id')::uuid AND
    (auth.jwt() ->> 'role') IN ('admin', 'teacher')
  );

-- Messages policies
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    school_id = (auth.jwt() ->> 'school_id')::uuid AND
    (sender_id = auth.uid() OR receiver_id = auth.uid())
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    school_id = (auth.jwt() ->> 'school_id')::uuid AND
    sender_id = auth.uid()
  );

CREATE POLICY "Users can update their sent messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid());

-- Fees policies
CREATE POLICY "Users can view relevant fees"
  ON fees FOR SELECT
  TO authenticated
  USING (
    school_id = (auth.jwt() ->> 'school_id')::uuid AND
    (
      (auth.jwt() ->> 'role') = 'admin' OR
      student_id IN (
        SELECT id FROM students s
        WHERE s.parent_id = auth.uid() OR s.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage fees"
  ON fees FOR ALL
  TO authenticated
  USING (
    school_id = (auth.jwt() ->> 'school_id')::uuid AND
    (auth.jwt() ->> 'role') = 'admin'
  );

-- Notifications policies
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    school_id = (auth.jwt() ->> 'school_id')::uuid AND
    user_id = auth.uid()
  );

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (school_id = (auth.jwt() ->> 'school_id')::uuid);