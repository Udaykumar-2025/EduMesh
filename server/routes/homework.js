const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { supabase } = require('../config/database');
const { requireRole } = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * /api/homework:
 *   get:
 *     summary: Get homework assignments
 *     tags: [Homework]
 *     parameters:
 *       - in: query
 *         name: class_name
 *         schema:
 *           type: string
 *       - in: query
 *         name: subject_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed]
 *     responses:
 *       200:
 *         description: List of homework assignments
 */
router.get('/', async (req, res) => {
  try {
    const { class_name, subject_id, status = 'active' } = req.query;
    
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

    const { data: homework, error } = await query.order('due_date', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: homework
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/homework:
 *   post:
 *     summary: Create new homework assignment
 *     tags: [Homework]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject_id:
 *                 type: string
 *               class_name:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date
 *               max_marks:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Homework created successfully
 */
router.post('/', requireRole(['admin', 'teacher']), [
  body('subject_id').isUUID().withMessage('Valid subject ID is required'),
  body('class_name').notEmpty().withMessage('Class name is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('due_date').isISO8601().withMessage('Valid due date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { subject_id, class_name, title, description, due_date, max_marks = 0 } = req.body;

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
        max_marks
      })
      .select()
      .single();

    if (error) throw error;

    // Create notifications for students and parents
    const { data: students } = await supabase
      .from('students')
      .select('user_id, parent_id')
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
          message: `New homework: ${title}`,
          type: 'homework',
          data: { homework_id: homework.id }
        });
      }
      
      // Notification for parent
      if (student.parent_id) {
        notifications.push({
          user_id: student.parent_id,
          school_id: req.schoolId,
          title: 'New Homework Assigned',
          message: `New homework assigned to your child: ${title}`,
          type: 'homework',
          data: { homework_id: homework.id }
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/homework/{id}/submit:
 *   post:
 *     summary: Submit homework
 *     tags: [Homework]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Homework submitted successfully
 */
router.post('/:id/submit', requireRole(['student']), async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, attachments = [] } = req.body;

    // Get student ID
    const { data: student } = await supabase
      .from('students')
      .select('id')
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
      .select('*')
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

    res.status(201).json({
      success: true,
      message: 'Homework submitted successfully',
      data: submission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/homework/{id}/submissions:
 *   get:
 *     summary: Get homework submissions
 *     tags: [Homework]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of homework submissions
 */
router.get('/:id/submissions', requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { id } = req.params;

    const { data: submissions, error } = await supabase
      .from('homework_submissions')
      .select(`
        *,
        students(student_id, users(name))
      `)
      .eq('homework_id', id)
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;