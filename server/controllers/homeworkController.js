const { validationResult } = require('express-validator');
const { supabase } = require('../config/database');

class HomeworkController {
  // Get homework assignments
  async getHomework(req, res) {
    try {
      const { class_name, subject_id, status = 'active', page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      
      let query = supabase
        .from('homework')
        .select(`
          *,
          subjects(name, color),
          teachers(user_id, users(name))
        `)
        .eq('school_id', req.schoolId)
        .eq('is_active', status === 'active');

      if (class_name) {
        query = query.eq('class_name', class_name);
      }

      if (subject_id) {
        query = query.eq('subject_id', subject_id);
      }

      // Role-based filtering
      if (req.userRole === 'teacher') {
        const { data: teacher } = await supabase
          .from('teachers')
          .select('id')
          .eq('user_id', req.userId)
          .single();
        
        if (teacher) {
          query = query.eq('teacher_id', teacher.id);
        }
      } else if (req.userRole === 'parent' || req.userRole === 'student') {
        const { data: students } = await supabase
          .from('students')
          .select('class_name')
          .or(req.userRole === 'parent' ? `parent_id.eq.${req.userId}` : `user_id.eq.${req.userId}`);
        
        if (students.length > 0) {
          const classNames = students.map(s => s.class_name);
          query = query.in('class_name', classNames);
        }
      }

      const { data: homework, error, count } = await query
        .order('due_date', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Get submission status for students/parents
      if ((req.userRole === 'student' || req.userRole === 'parent') && homework.length > 0) {
        const homeworkIds = homework.map(hw => hw.id);
        let studentIds = [];

        if (req.userRole === 'student') {
          const { data: student } = await supabase
            .from('students')
            .select('id')
            .eq('user_id', req.userId)
            .single();
          if (student) studentIds = [student.id];
        } else {
          const { data: students } = await supabase
            .from('students')
            .select('id')
            .eq('parent_id', req.userId);
          studentIds = students.map(s => s.id);
        }

        if (studentIds.length > 0) {
          const { data: submissions } = await supabase
            .from('homework_submissions')
            .select('homework_id, student_id, status, submitted_at, marks_obtained')
            .in('homework_id', homeworkIds)
            .in('student_id', studentIds);

          // Add submission info to homework
          homework.forEach(hw => {
            hw.submissions = submissions.filter(sub => sub.homework_id === hw.id);
            hw.isSubmitted = hw.submissions.length > 0;
          });
        }
      }

      res.json({
        success: true,
        data: homework,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get Homework Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch homework'
      });
    }
  }

  // Create homework assignment
  async createHomework(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { subject_id, class_name, title, description, due_date, max_marks = 0, attachments = [] } = req.body;

      // Get teacher ID
      let teacherId;
      if (req.userRole === 'teacher') {
        const { data: teacher } = await supabase
          .from('teachers')
          .select('id')
          .eq('user_id', req.userId)
          .single();
        teacherId = teacher?.id;
      } else {
        // Admin can assign homework on behalf of teachers
        teacherId = req.body.teacher_id;
      }

      if (!teacherId) {
        return res.status(400).json({
          success: false,
          message: 'Teacher ID is required'
        });
      }

      // Verify subject exists
      const { data: subject } = await supabase
        .from('subjects')
        .select('name')
        .eq('id', subject_id)
        .eq('school_id', req.schoolId)
        .single();

      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }

      const { data: homework, error } = await supabase
        .from('homework')
        .insert({
          school_id: req.schoolId,
          teacher_id: teacherId,
          subject_id,
          class_name,
          title,
          description,
          due_date,
          max_marks,
          attachments
        })
        .select(`
          *,
          subjects(name, color),
          teachers(user_id, users(name))
        `)
        .single();

      if (error) throw error;

      // Create notifications for students and parents
      const { data: students } = await supabase
        .from('students')
        .select('user_id, parent_id, users(name)')
        .eq('school_id', req.schoolId)
        .eq('class_name', class_name);

      const notifications = [];
      students.forEach(student => {
        // Notification for student
        if (student.user_id) {
          notifications.push({
            user_id: student.user_id,
            school_id: req.schoolId,
            title: 'New Homework Assigned',
            message: `New homework: ${title} in ${subject.name}`,
            type: 'homework',
            data: { homework_id: homework.id, subject: subject.name }
          });
        }
        
        // Notification for parent
        if (student.parent_id) {
          notifications.push({
            user_id: student.parent_id,
            school_id: req.schoolId,
            title: 'New Homework Assigned',
            message: `New homework assigned to ${student.users.name}: ${title}`,
            type: 'homework',
            data: { homework_id: homework.id, student_name: student.users.name }
          });
        }
      });

      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications);
      }

      res.status(201).json({
        success: true,
        message: 'Homework created successfully',
        data: homework
      });
    } catch (error) {
      console.error('Create Homework Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create homework'
      });
    }
  }

  // Submit homework
  async submitHomework(req, res) {
    try {
      const { id } = req.params;
      const { notes, attachments = [] } = req.body;

      // Get student ID
      const { data: student } = await supabase
        .from('students')
        .select('id, users(name)')
        .eq('user_id', req.userId)
        .single();

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Check if homework exists and is active
      const { data: homework } = await supabase
        .from('homework')
        .select('*, subjects(name)')
        .eq('id', id)
        .eq('school_id', req.schoolId)
        .eq('is_active', true)
        .single();

      if (!homework) {
        return res.status(404).json({
          success: false,
          message: 'Homework not found'
        });
      }

      // Check if already submitted
      const { data: existingSubmission } = await supabase
        .from('homework_submissions')
        .select('id')
        .eq('homework_id', id)
        .eq('student_id', student.id)
        .single();

      if (existingSubmission) {
        return res.status(400).json({
          success: false,
          message: 'Homework already submitted'
        });
      }

      // Create submission
      const status = new Date() > new Date(homework.due_date) ? 'late' : 'submitted';
      
      const { data: submission, error } = await supabase
        .from('homework_submissions')
        .insert({
          homework_id: id,
          student_id: student.id,
          notes,
          attachments,
          status
        })
        .select()
        .single();

      if (error) throw error;

      // Notify teacher
      const { data: teacher } = await supabase
        .from('teachers')
        .select('user_id')
        .eq('id', homework.teacher_id)
        .single();

      if (teacher?.user_id) {
        await supabase.from('notifications').insert({
          user_id: teacher.user_id,
          school_id: req.schoolId,
          title: 'Homework Submitted',
          message: `${student.users.name} submitted homework: ${homework.title}`,
          type: 'homework',
          data: { 
            homework_id: homework.id, 
            student_name: student.users.name,
            submission_id: submission.id
          }
        });
      }

      res.status(201).json({
        success: true,
        message: 'Homework submitted successfully',
        data: submission
      });
    } catch (error) {
      console.error('Submit Homework Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit homework'
      });
    }
  }

  // Get homework submissions (for teachers)
  async getSubmissions(req, res) {
    try {
      const { id } = req.params;
      const { status, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      // Verify homework exists and teacher has access
      let homeworkQuery = supabase
        .from('homework')
        .select('*')
        .eq('id', id)
        .eq('school_id', req.schoolId);

      if (req.userRole === 'teacher') {
        const { data: teacher } = await supabase
          .from('teachers')
          .select('id')
          .eq('user_id', req.userId)
          .single();
        
        if (teacher) {
          homeworkQuery = homeworkQuery.eq('teacher_id', teacher.id);
        }
      }

      const { data: homework } = await homeworkQuery.single();

      if (!homework) {
        return res.status(404).json({
          success: false,
          message: 'Homework not found or access denied'
        });
      }

      let submissionsQuery = supabase
        .from('homework_submissions')
        .select(`
          *,
          students(student_id, users(name), class_name)
        `)
        .eq('homework_id', id);

      if (status) {
        submissionsQuery = submissionsQuery.eq('status', status);
      }

      const { data: submissions, error, count } = await submissionsQuery
        .order('submitted_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      res.json({
        success: true,
        data: {
          homework,
          submissions,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            pages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get Submissions Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch submissions'
      });
    }
  }

  // Grade homework submission
  async gradeSubmission(req, res) {
    try {
      const { submissionId } = req.params;
      const { marks_obtained, feedback } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      // Verify submission exists and teacher has access
      const { data: submission } = await supabase
        .from('homework_submissions')
        .select(`
          *,
          homework(teacher_id, max_marks, title),
          students(users(name))
        `)
        .eq('id', submissionId)
        .single();

      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
      }

      // Check if teacher has access
      if (req.userRole === 'teacher') {
        const { data: teacher } = await supabase
          .from('teachers')
          .select('id')
          .eq('user_id', req.userId)
          .single();
        
        if (!teacher || teacher.id !== submission.homework.teacher_id) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      }

      // Validate marks
      if (marks_obtained > submission.homework.max_marks) {
        return res.status(400).json({
          success: false,
          message: `Marks cannot exceed maximum marks (${submission.homework.max_marks})`
        });
      }

      // Update submission
      const { data: updatedSubmission, error } = await supabase
        .from('homework_submissions')
        .update({
          marks_obtained,
          feedback,
          status: 'graded'
        })
        .eq('id', submissionId)
        .select()
        .single();

      if (error) throw error;

      // Notify student and parent
      const { data: student } = await supabase
        .from('students')
        .select('user_id, parent_id')
        .eq('id', submission.student_id)
        .single();

      const notifications = [];
      
      if (student?.user_id) {
        notifications.push({
          user_id: student.user_id,
          school_id: req.schoolId,
          title: 'Homework Graded',
          message: `Your homework "${submission.homework.title}" has been graded: ${marks_obtained}/${submission.homework.max_marks}`,
          type: 'homework',
          data: { 
            homework_id: submission.homework_id,
            marks: marks_obtained,
            max_marks: submission.homework.max_marks
          }
        });
      }

      if (student?.parent_id) {
        notifications.push({
          user_id: student.parent_id,
          school_id: req.schoolId,
          title: 'Homework Graded',
          message: `${submission.students.users.name}'s homework has been graded: ${marks_obtained}/${submission.homework.max_marks}`,
          type: 'homework',
          data: { 
            homework_id: submission.homework_id,
            student_name: submission.students.users.name,
            marks: marks_obtained,
            max_marks: submission.homework.max_marks
          }
        });
      }

      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications);
      }

      res.json({
        success: true,
        message: 'Homework graded successfully',
        data: updatedSubmission
      });
    } catch (error) {
      console.error('Grade Submission Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to grade homework'
      });
    }
  }

  // Update homework
  async updateHomework(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Remove fields that shouldn't be updated
      delete updates.id;
      delete updates.school_id;
      delete updates.created_at;

      // Verify homework exists and teacher has access
      let homeworkQuery = supabase
        .from('homework')
        .select('*')
        .eq('id', id)
        .eq('school_id', req.schoolId);

      if (req.userRole === 'teacher') {
        const { data: teacher } = await supabase
          .from('teachers')
          .select('id')
          .eq('user_id', req.userId)
          .single();
        
        if (teacher) {
          homeworkQuery = homeworkQuery.eq('teacher_id', teacher.id);
        }
      }

      const { data: existingHomework } = await homeworkQuery.single();

      if (!existingHomework) {
        return res.status(404).json({
          success: false,
          message: 'Homework not found or access denied'
        });
      }

      const { data: homework, error } = await supabase
        .from('homework')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          subjects(name, color),
          teachers(user_id, users(name))
        `)
        .single();

      if (error) throw error;

      res.json({
        success: true,
        message: 'Homework updated successfully',
        data: homework
      });
    } catch (error) {
      console.error('Update Homework Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update homework'
      });
    }
  }

  // Delete homework
  async deleteHomework(req, res) {
    try {
      const { id } = req.params;

      // Verify homework exists and teacher has access
      let homeworkQuery = supabase
        .from('homework')
        .select('*')
        .eq('id', id)
        .eq('school_id', req.schoolId);

      if (req.userRole === 'teacher') {
        const { data: teacher } = await supabase
          .from('teachers')
          .select('id')
          .eq('user_id', req.userId)
          .single();
        
        if (teacher) {
          homeworkQuery = homeworkQuery.eq('teacher_id', teacher.id);
        }
      }

      const { data: homework } = await homeworkQuery.single();

      if (!homework) {
        return res.status(404).json({
          success: false,
          message: 'Homework not found or access denied'
        });
      }

      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('homework')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      res.json({
        success: true,
        message: 'Homework deleted successfully'
      });
    } catch (error) {
      console.error('Delete Homework Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete homework'
      });
    }
  }
}

module.exports = new HomeworkController();