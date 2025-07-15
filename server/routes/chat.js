const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/database');
const router = express.Router();

/**
 * @swagger
 * /api/chat/conversations:
 *   get:
 *     summary: Get user's conversations
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: List of conversations
 */
router.get('/conversations', async (req, res) => {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, name, role),
        receiver:receiver_id(id, name, role)
      `)
      .or(`sender_id.eq.${req.userId},receiver_id.eq.${req.userId}`)
      .eq('school_id', req.schoolId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group messages by conversation
    const conversations = {};
    
    messages.forEach(message => {
      const otherUserId = message.sender_id === req.userId ? message.receiver_id : message.sender_id;
      const otherUser = message.sender_id === req.userId ? message.receiver : message.sender;
      
      if (!conversations[otherUserId]) {
        conversations[otherUserId] = {
          user: otherUser,
          lastMessage: message,
          unreadCount: 0,
          messages: []
        };
      }
      
      conversations[otherUserId].messages.push(message);
      
      // Count unread messages
      if (message.receiver_id === req.userId && !message.is_read) {
        conversations[otherUserId].unreadCount++;
      }
    });

    // Convert to array and sort by last message time
    const conversationList = Object.values(conversations).sort((a, b) => 
      new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at)
    );

    res.json({
      success: true,
      data: conversationList
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
 * /api/chat/messages/{userId}:
 *   get:
 *     summary: Get messages with specific user
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get('/messages/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, name, role),
        receiver:receiver_id(id, name, role)
      `)
      .or(`and(sender_id.eq.${req.userId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${req.userId})`)
      .eq('school_id', req.schoolId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Mark messages as read
    await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('sender_id', userId)
      .eq('receiver_id', req.userId)
      .eq('is_read', false);

    res.json({
      success: true,
      data: messages.reverse() // Return in chronological order
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
 * /api/chat/send:
 *   post:
 *     summary: Send a message
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiver_id:
 *                 type: string
 *               content:
 *                 type: string
 *               message_type:
 *                 type: string
 *                 enum: [text, image, file]
 *                 default: text
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 */
router.post('/send', [
  body('receiver_id').isUUID().withMessage('Valid receiver ID is required'),
  body('content').notEmpty().withMessage('Message content is required'),
  body('message_type').optional().isIn(['text', 'image', 'file']).withMessage('Invalid message type')
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

    const { receiver_id, content, message_type = 'text', attachments = [] } = req.body;

    // Verify receiver exists in same school
    const { data: receiver, error: receiverError } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('id', receiver_id)
      .eq('school_id', req.schoolId)
      .eq('is_active', true)
      .single();

    if (receiverError || !receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Create message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        sender_id: req.userId,
        receiver_id,
        school_id: req.schoolId,
        content,
        message_type,
        attachments
      })
      .select(`
        *,
        sender:sender_id(id, name, role),
        receiver:receiver_id(id, name, role)
      `)
      .single();

    if (error) throw error;

    // Create notification for receiver
    await supabase.from('notifications').insert({
      user_id: receiver_id,
      school_id: req.schoolId,
      title: 'New Message',
      message: `New message from ${req.user.name}`,
      type: 'message',
      data: { message_id: message.id, sender_id: req.userId }
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
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
 * /api/chat/users:
 *   get:
 *     summary: Get users available for chat
 *     tags: [Chat]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, teacher, parent, student]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', async (req, res) => {
  try {
    const { role, search } = req.query;
    
    let query = supabase
      .from('users')
      .select('id, name, role, avatar_url')
      .eq('school_id', req.schoolId)
      .eq('is_active', true)
      .neq('id', req.userId); // Exclude current user

    if (role) {
      query = query.eq('role', role);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Role-based filtering
    if (req.userRole === 'parent') {
      // Parents can chat with teachers and admins
      query = query.in('role', ['teacher', 'admin']);
    } else if (req.userRole === 'student') {
      // Students can chat with teachers and admins
      query = query.in('role', ['teacher', 'admin']);
    } else if (req.userRole === 'teacher') {
      // Teachers can chat with parents, students, and admins
      query = query.in('role', ['parent', 'student', 'admin']);
    }
    // Admins can chat with everyone (no additional filtering)

    const { data: users, error } = await query.order('name');

    if (error) throw error;

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;