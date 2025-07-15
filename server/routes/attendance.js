const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/database');
const { requireRole } = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Get attendance records
 *     tags: [Attendance]
 *     parameters:
 *       - in: query
 *         name: class_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of attendance records
 */
router.get('/', async (req, res) => {
  try {
    const { class_id, date, student_id } = req.query;
    
    let query = supabase
      .from('attendance')
      .select(`
        *,
        students(student_id, users(name), class_name),
        classes(name, subject_id, subjects(name))
      `)
      .eq('school_id', req.schoolId);

    if (class_id) {
      query = query.eq('class_id', class_id);
    }

    if (date) {
      query = query.eq('date', date);
    }

    if (student_id) {
      query = query.eq('student_id', student_id);
    }

    // Role-based filtering
    if (req.userRole === 'teacher') {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', req.userId)
        .single();
      
      if (teacher) {
        const { data: classes } = await supabase
          .from('classes')
          .select('id')
          .eq('teacher_id', teacher.id);
        
        const classIds = classes.map(c => c.id);
        query = query.in('class_id', classIds);
      }
    } else if (req.userRole === 'parent' || req.userRole === 'student') {
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .or(req.userRole === 'parent' ? `parent_id.eq.${req.userId}` : `user_id.eq.${req.userId}`);
      
      if (students.length > 0) {
        const studentIds = students.map(s => s.id);
        query = query.in('student_id', studentIds);
      }
    }

    const { data: attendance, error } = await query.order('date', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: attendance
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
 * /api/attendance/mark:
 *   post:
 *     summary: Mark attendance for students
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               class_id:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               attendance:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     student_id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [present, absent, late, excused]
 *                     notes:
 *                       type: string
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 */
router.post('/mark', requireRole(['admin', 'teacher']), [
  body('class_id').isUUID().withMessage('Valid class ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('attendance').isArray().withMessage('Attendance array is required')
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

    const { class_id, date, attendance } = req.body;

    // Verify class exists and teacher has access
    const { data: classInfo } = await supabase
      .from('classes')
      .select('*')
      .eq('id', class_id)
      .eq('school_id', req.schoolId)
      .single();

    if (!classInfo) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    if (req.userRole === 'teacher') {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', req.userId)
        .single();
      
      if (teacher?.id !== classInfo.teacher_id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to mark attendance for this class'
        });
      }
    }

    // Prepare attendance records
    const attendanceRecords = attendance.map(record => ({
      school_id: req.schoolId,
      student_id: record.student_id,
      class_id,
      date,
      status: record.status,
      notes: record.notes || null,
      marked_by: req.userId
    }));

    // Delete existing attendance for this class and date
    await supabase
      .from('attendance')
      .delete()
      .eq('class_id', class_id)
      .eq('date', date);

    // Insert new attendance records
    const { data: newAttendance, error } = await supabase
      .from('attendance')
      .insert(attendanceRecords)
      .select();

    if (error) throw error;

    // Create notifications for absent students' parents
    const absentStudents = attendance.filter(a => a.status === 'absent');
    if (absentStudents.length > 0) {
      const { data: students } = await supabase
        .from('students')
        .select('parent_id, users(name)')
        .in('id', absentStudents.map(a => a.student_id))
        .not('parent_id', 'is', null);

      const notifications = students.map(student => ({
        user_id: student.parent_id,
        school_id: req.schoolId,
        title: 'Attendance Alert',
        message: `${student.users.name} was marked absent today`,
        type: 'attendance',
        data: { date, class_id }
      }));

      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: newAttendance
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
 * /api/attendance/summary:
 *   get:
 *     summary: Get attendance summary
 *     tags: [Attendance]
 *     parameters:
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance summary
 */
router.get('/summary', async (req, res) => {
  try {
    const { student_id, month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month || (currentDate.getMonth() + 1);
    const targetYear = year || currentDate.getFullYear();

    let studentIds = [];
    
    if (student_id) {
      studentIds = [student_id];
    } else if (req.userRole === 'parent') {
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('parent_id', req.userId);
      studentIds = students.map(s => s.id);
    } else if (req.userRole === 'student') {
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', req.userId)
        .single();
      studentIds = student ? [student.id] : [];
    }

    if (studentIds.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    const startDate = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`;
    const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

    const { data: attendance, error } = await supabase
      .from('attendance')
      .select(`
        student_id,
        status,
        date,
        students(student_id, users(name))
      `)
      .in('student_id', studentIds)
      .gte('date', startDate)
      .lte('date', endDate)
      .eq('school_id', req.schoolId);

    if (error) throw error;

    // Calculate summary
    const summary = {};
    attendance.forEach(record => {
      if (!summary[record.student_id]) {
        summary[record.student_id] = {
          student: record.students,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          total: 0
        };
      }
      summary[record.student_id][record.status]++;
      summary[record.student_id].total++;
    });

    // Calculate attendance percentage
    Object.keys(summary).forEach(studentId => {
      const data = summary[studentId];
      data.percentage = data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;
    });

    res.json({
      success: true,
      data: Object.values(summary)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;