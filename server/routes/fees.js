const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/database');
const { requireRole } = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * /api/fees:
 *   get:
 *     summary: Get fee records
 *     tags: [Fees]
 *     parameters:
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, overdue, cancelled]
 *     responses:
 *       200:
 *         description: List of fee records
 */
router.get('/', async (req, res) => {
  try {
    const { student_id, status } = req.query;
    
    let query = supabase
      .from('fees')
      .select(`
        *,
        students(student_id, users(name), class_name)
      `)
      .eq('school_id', req.schoolId);

    if (student_id) {
      query = query.eq('student_id', student_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Role-based filtering
    if (req.userRole === 'parent') {
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('parent_id', req.userId);
      
      if (students.length > 0) {
        const studentIds = students.map(s => s.id);
        query = query.in('student_id', studentIds);
      }
    } else if (req.userRole === 'student') {
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', req.userId)
        .single();
      
      if (student) {
        query = query.eq('student_id', student.id);
      }
    }

    const { data: fees, error } = await query.order('due_date', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: fees
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
 * /api/fees:
 *   post:
 *     summary: Create new fee record
 *     tags: [Fees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               student_id:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               due_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Fee record created successfully
 */
router.post('/', requireRole(['admin']), [
  body('student_id').isUUID().withMessage('Valid student ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required'),
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

    const { student_id, title, description, amount, due_date } = req.body;

    const { data: fee, error } = await supabase
      .from('fees')
      .insert({
        school_id: req.schoolId,
        student_id,
        title,
        description,
        amount,
        due_date,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Create notification for parent
    const { data: student } = await supabase
      .from('students')
      .select('parent_id, users(name)')
      .eq('id', student_id)
      .single();

    if (student?.parent_id) {
      await supabase.from('notifications').insert({
        user_id: student.parent_id,
        school_id: req.schoolId,
        title: 'New Fee Due',
        message: `New fee: ${title} - $${amount}`,
        type: 'fee',
        data: { fee_id: fee.id }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Fee record created successfully',
      data: fee
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
 * /api/fees/{id}/pay:
 *   post:
 *     summary: Process fee payment
 *     tags: [Fees]
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
 *               payment_method:
 *                 type: string
 *               transaction_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment processed successfully
 */
router.post('/:id/pay', requireRole(['parent', 'admin']), [
  body('payment_method').notEmpty().withMessage('Payment method is required'),
  body('transaction_id').notEmpty().withMessage('Transaction ID is required')
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

    const { id } = req.params;
    const { payment_method, transaction_id } = req.body;

    // Verify fee exists and user has access
    let query = supabase
      .from('fees')
      .select('*, students(parent_id)')
      .eq('id', id)
      .eq('school_id', req.schoolId)
      .eq('status', 'pending');

    if (req.userRole === 'parent') {
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('parent_id', req.userId);
      
      const studentIds = students.map(s => s.id);
      query = query.in('student_id', studentIds);
    }

    const { data: fee, error: fetchError } = await query.single();

    if (fetchError || !fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found or already paid'
      });
    }

    // Update fee status
    const { data: updatedFee, error } = await supabase
      .from('fees')
      .update({
        status: 'paid',
        payment_method,
        transaction_id,
        paid_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Create notification
    if (fee.students?.parent_id) {
      await supabase.from('notifications').insert({
        user_id: fee.students.parent_id,
        school_id: req.schoolId,
        title: 'Payment Successful',
        message: `Payment of $${fee.amount} for ${fee.title} was successful`,
        type: 'fee',
        data: { fee_id: fee.id, transaction_id }
      });
    }

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: updatedFee
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
 * /api/fees/summary:
 *   get:
 *     summary: Get fee summary
 *     tags: [Fees]
 *     parameters:
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fee summary
 */
router.get('/summary', async (req, res) => {
  try {
    const { student_id } = req.query;
    
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
    } else if (req.userRole === 'admin') {
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('school_id', req.schoolId);
      studentIds = students.map(s => s.id);
    }

    if (studentIds.length === 0) {
      return res.json({
        success: true,
        data: {
          total_pending: 0,
          total_paid: 0,
          total_overdue: 0,
          pending_amount: 0,
          paid_amount: 0,
          overdue_amount: 0
        }
      });
    }

    const { data: fees, error } = await supabase
      .from('fees')
      .select('status, amount, due_date')
      .in('student_id', studentIds)
      .eq('school_id', req.schoolId);

    if (error) throw error;

    const summary = {
      total_pending: 0,
      total_paid: 0,
      total_overdue: 0,
      pending_amount: 0,
      paid_amount: 0,
      overdue_amount: 0
    };

    const currentDate = new Date();
    
    fees.forEach(fee => {
      const amount = parseFloat(fee.amount);
      
      if (fee.status === 'paid') {
        summary.total_paid++;
        summary.paid_amount += amount;
      } else if (fee.status === 'pending') {
        if (new Date(fee.due_date) < currentDate) {
          summary.total_overdue++;
          summary.overdue_amount += amount;
        } else {
          summary.total_pending++;
          summary.pending_amount += amount;
        }
      }
    });

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;