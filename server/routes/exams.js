const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/database');
const { requireRole } = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * /api/exams:
 *   get:
 *     summary: Get exam schedules
 *     tags: [Exams]
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
 *           enum: [upcoming, ongoing, completed, cancelled]
 *     responses:
 *       200:
 *         description: List of exams
 */
router.get('/', async (req, res) => {
  try {
    const { class_name, subject_id, status } = req.query;
    
    let query = supabase
      .from('exams')
      .select(`
        *,
        subjects(name, color)
      `)
      .eq('school_id', req.schoolId);

    if (class_name) {
      query = query.eq('class_name', class_name);
    }

    if (subject_id) {
      query = query.eq('subject_id', subject_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Role-based filtering
    if (req.userRole === 'parent' || req.userRole === 'student') {
      const { data: students } = await supabase
        .from('students')
        .select('class_name')
        .or(req.userRole === 'parent' ? `parent_id.eq.${req.userId}` : `user_id.eq.${req.userId}`);
      
      if (students.length > 0) {
        const classNames = students.map(s => s.class_name);
        query = query.in('class_name', classNames);
      }
    }

    const { data: exams, error } = await query.order('exam_date', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: exams
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
 * /api/exams:
 *   post:
 *     summary: Create new exam
 *     tags: [Exams]
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
 *               exam_date:
 *                 type: string
 *                 format: date
 *               start_time:
 *                 type: string
 *               end_time:
 *                 type: string
 *               location:
 *                 type: string
 *               max_marks:
 *                 type: integer
 *               instructions:
 *                 type: string
 *     responses:
 *       201:
 *         description: Exam created successfully
 */
router.post('/', requireRole(['admin', 'teacher']), [
  body('subject_id').isUUID().withMessage('Valid subject ID is required'),
  body('class_name').notEmpty().withMessage('Class name is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('exam_date').isISO8601().withMessage('Valid exam date is required'),
  body('start_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required'),
  body('end_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required')
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

    const { 
      subject_id, 
      class_name, 
      title, 
      exam_date, 
      start_time, 
      end_time, 
      location, 
      max_marks = 100, 
      instructions 
    } = req.body;

    const { data: exam, error } = await supabase
      .from('exams')
      .insert({
        school_id: req.schoolId,
        subject_id,
        class_name,
        title,
        exam_date,
        start_time,
        end_time,
        location,
        max_marks,
        instructions,
        status: 'upcoming'
      })
      .select()
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
          title: 'New Exam Scheduled',
          message: `Exam scheduled: ${title} on ${exam_date}`,
          type: 'exam',
          data: { exam_id: exam.id }
        });
      }
      
      // Notification for parent
      if (student.parent_id) {
        notifications.push({
          user_id: student.parent_id,
          school_id: req.schoolId,
          title: 'New Exam Scheduled',
          message: `Exam scheduled for ${student.users.name}: ${title} on ${exam_date}`,
          type: 'exam',
          data: { exam_id: exam.id }
        });
      }
    });

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications);
    }

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: exam
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
 * /api/exams/{id}:
 *   put:
 *     summary: Update exam
 *     tags: [Exams]
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
 *               title:
 *                 type: string
 *               exam_date:
 *                 type: string
 *                 format: date
 *               start_time:
 *                 type: string
 *               end_time:
 *                 type: string
 *               location:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [upcoming, ongoing, completed, cancelled]
 *     responses:
 *       200:
 *         description: Exam updated successfully
 */
router.put('/:id', requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: exam, error } = await supabase
      .from('exams')
      .update(updates)
      .eq('id', id)
      .eq('school_id', req.schoolId)
      .select()
      .single();

    if (error) throw error;

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    res.json({
      success: true,
      message: 'Exam updated successfully',
      data: exam
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
 * /api/exams/{id}:
 *   delete:
 *     summary: Delete exam
 *     tags: [Exams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exam deleted successfully
 */
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', id)
      .eq('school_id', req.schoolId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;