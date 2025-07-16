const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

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
], authController.sendOTP);

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
], authController.verifyOTP);

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
], authController.register);

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
], authController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post('/refresh', authController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;