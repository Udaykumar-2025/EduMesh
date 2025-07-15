const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/database');
const { sendOTP, verifyOTP } = require('../services/otpService');
const router = express.Router();

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP for authentication
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contact:
 *                 type: string
 *               method:
 *                 type: string
 *                 enum: [phone, email]
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post('/send-otp', [
  body('contact').notEmpty().withMessage('Contact is required'),
  body('method').isIn(['phone', 'email']).withMessage('Method must be phone or email')
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

    const { contact, method } = req.body;
    
    // Send OTP
    const otpResult = await sendOTP(contact, method);
    
    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: { otpId: otpResult.otpId }
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
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and get user info
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contact:
 *                 type: string
 *               otp:
 *                 type: string
 *               method:
 *                 type: string
 *                 enum: [phone, email]
 *     responses:
 *       200:
 *         description: OTP verified successfully
 */
router.post('/verify-otp', [
  body('contact').notEmpty().withMessage('Contact is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('method').isIn(['phone', 'email']).withMessage('Method must be phone or email')
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

    const { contact, otp, method } = req.body;
    
    // Verify OTP
    const isValid = await verifyOTP(contact, otp);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .or(method === 'email' ? `email.eq.${contact}` : `phone.eq.${contact}`)
      .single();

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        userExists: !!existingUser,
        user: existingUser || null
      }
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
 * /api/auth/register:
 *   post:
 *     summary: Register new user with role
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, teacher, parent, student]
 *               schoolCode:
 *                 type: string
 *               schoolName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('role').isIn(['admin', 'teacher', 'parent', 'student']).withMessage('Invalid role'),
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

    const { name, email, phone, role, schoolCode, schoolName } = req.body;
    let schoolId;

    // Handle school logic
    if (role === 'admin') {
      if (schoolCode) {
        // Join existing school
        const { data: school, error } = await supabase
          .from('schools')
          .select('id')
          .eq('code', schoolCode)
          .single();

        if (error || !school) {
          return res.status(400).json({
            success: false,
            message: 'Invalid school code'
          });
        }
        schoolId = school.id;
      } else if (schoolName) {
        // Create new school
        const schoolCode = `SCH${Date.now()}`;
        const { data: newSchool, error } = await supabase
          .from('schools')
          .insert({
            name: schoolName,
            code: schoolCode,
            region: 'Default Region',
            admin_email: email
          })
          .select()
          .single();

        if (error) {
          return res.status(400).json({
            success: false,
            message: 'Failed to create school'
          });
        }
        schoolId = newSchool.id;
      }
    } else {
      // Non-admin users must provide school code
      if (!schoolCode) {
        return res.status(400).json({
          success: false,
          message: 'School code is required'
        });
      }

      const { data: school, error } = await supabase
        .from('schools')
        .select('id')
        .eq('code', schoolCode)
        .single();

      if (error || !school) {
        return res.status(400).json({
          success: false,
          message: 'Invalid school code'
        });
      }
      schoolId = school.id;
    }

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        phone,
        role,
        school_id: schoolId,
        is_active: true
      })
      .select()
      .single();

    if (userError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create user'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        schoolId: user.school_id, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          schoolId: user.school_id
        },
        token
      }
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
 * /api/auth/login:
 *   post:
 *     summary: Login existing user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contact:
 *                 type: string
 *               method:
 *                 type: string
 *                 enum: [phone, email]
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', [
  body('contact').notEmpty().withMessage('Contact is required'),
  body('method').isIn(['phone', 'email']).withMessage('Method must be phone or email')
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

    const { contact, method } = req.body;

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .or(method === 'email' ? `email.eq.${contact}` : `phone.eq.${contact}`)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        schoolId: user.school_id, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          schoolId: user.school_id
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;