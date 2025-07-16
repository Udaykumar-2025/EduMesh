const express = require('express');
const { body, param } = require('express-validator');
const homeworkController = require('../controllers/homeworkController');
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
router.get('/', homeworkController.getHomework);

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
], homeworkController.createHomework);

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
router.post('/:id/submit', requireRole(['student']), [
  param('id').isUUID().withMessage('Valid homework ID is required')
], homeworkController.submitHomework);

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
router.get('/:id/submissions', requireRole(['admin', 'teacher']), [
  param('id').isUUID().withMessage('Valid homework ID is required')
], homeworkController.getSubmissions);

/**
 * @swagger
 * /api/homework/submissions/{submissionId}/grade:
 *   put:
 *     summary: Grade homework submission
 *     tags: [Homework]
 *     parameters:
 *       - in: path
 *         name: submissionId
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
 *               marks_obtained:
 *                 type: integer
 *               feedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Homework graded successfully
 */
router.put('/submissions/:submissionId/grade', requireRole(['admin', 'teacher']), [
  param('submissionId').isUUID().withMessage('Valid submission ID is required'),
  body('marks_obtained').isInt({ min: 0 }).withMessage('Valid marks are required'),
  body('feedback').optional().isString().withMessage('Feedback must be a string')
], homeworkController.gradeSubmission);

/**
 * @swagger
 * /api/homework/{id}:
 *   put:
 *     summary: Update homework
 *     tags: [Homework]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Homework updated successfully
 */
router.put('/:id', requireRole(['admin', 'teacher']), [
  param('id').isUUID().withMessage('Valid homework ID is required')
], homeworkController.updateHomework);

/**
 * @swagger
 * /api/homework/{id}:
 *   delete:
 *     summary: Delete homework
 *     tags: [Homework]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Homework deleted successfully
 */
router.delete('/:id', requireRole(['admin', 'teacher']), [
  param('id').isUUID().withMessage('Valid homework ID is required')
], homeworkController.deleteHomework);

module.exports = router;