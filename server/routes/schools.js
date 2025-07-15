const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/database');
const { requireRole } = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * /api/schools/info:
 *   get:
 *     summary: Get school information
 *     tags: [Schools]
 *     responses:
 *       200:
 *         description: School information
 */
router.get('/info', async (req, res) => {
  try {
    const { data: school, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', req.schoolId)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: school
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
 * /api/schools/info:
 *   put:
 *     summary: Update school information
 *     tags: [Schools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               website:
 *                 type: string
 *               logo_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: School updated successfully
 */
router.put('/info', requireRole(['admin']), [
  body('name').optional().notEmpty().withMessage('School name cannot be empty'),
  body('website').optional().isURL().withMessage('Invalid website URL'),
  body('logo_url').optional().isURL().withMessage('Invalid logo URL')
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

    const updates = {};
    const allowedFields = ['name', 'address', 'phone', 'website', 'logo_url'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const { data: school, error } = await supabase
      .from('schools')
      .update(updates)
      .eq('id', req.schoolId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'School updated successfully',
      data: school
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
 * /api/schools/stats:
 *   get:
 *     summary: Get school statistics
 *     tags: [Schools]
 *     responses:
 *       200:
 *         description: School statistics
 */
router.get('/stats', requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    // Get counts for different entities
    const [
      { count: totalTeachers },
      { count: totalStudents },
      { count: totalClasses },
      { count: activeHomework },
      { count: upcomingExams }
    ] = await Promise.all([
      supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('school_id', req.schoolId),
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', req.schoolId),
      supabase.from('classes').select('*', { count: 'exact', head: true }).eq('school_id', req.schoolId).eq('is_active', true),
      supabase.from('homework').select('*', { count: 'exact', head: true }).eq('school_id', req.schoolId).eq('is_active', true),
      supabase.from('exams').select('*', { count: 'exact', head: true }).eq('school_id', req.schoolId).eq('status', 'upcoming')
    ]);

    // Get attendance rate for current month
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

    const { data: attendanceData } = await supabase
      .from('attendance')
      .select('status')
      .eq('school_id', req.schoolId)
      .gte('date', startOfMonth)
      .lte('date', endOfMonth);

    let attendanceRate = 0;
    if (attendanceData && attendanceData.length > 0) {
      const presentCount = attendanceData.filter(a => a.status === 'present').length;
      attendanceRate = Math.round((presentCount / attendanceData.length) * 100);
    }

    const stats = {
      total_teachers: totalTeachers || 0,
      total_students: totalStudents || 0,
      total_classes: totalClasses || 0,
      active_homework: activeHomework || 0,
      upcoming_exams: upcomingExams || 0,
      attendance_rate: attendanceRate
    };

    res.json({
      success: true,
      data: stats
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
 * /api/schools/subjects:
 *   get:
 *     summary: Get school subjects
 *     tags: [Schools]
 *     responses:
 *       200:
 *         description: List of subjects
 */
router.get('/subjects', async (req, res) => {
  try {
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('school_id', req.schoolId)
      .order('name');

    if (error) throw error;

    res.json({
      success: true,
      data: subjects
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
 * /api/schools/subjects:
 *   post:
 *     summary: Create new subject
 *     tags: [Schools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subject created successfully
 */
router.post('/subjects', requireRole(['admin']), [
  body('name').notEmpty().withMessage('Subject name is required'),
  body('code').notEmpty().withMessage('Subject code is required'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Invalid color format')
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

    const { name, code, description, color = '#3B82F6' } = req.body;

    const { data: subject, error } = await supabase
      .from('subjects')
      .insert({
        school_id: req.schoolId,
        name,
        code,
        description,
        color
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Subject code already exists'
        });
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;