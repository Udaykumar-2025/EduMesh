const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const schoolRoutes = require('./routes/schools');
const homeworkRoutes = require('./routes/homework');
const attendanceRoutes = require('./routes/attendance');
const examRoutes = require('./routes/exams');
const feeRoutes = require('./routes/fees');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notifications');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EduMesh API',
      version: '1.0.0',
      description: 'School Management System API',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/schools', authenticateToken, schoolRoutes);
app.use('/api/homework', authenticateToken, homeworkRoutes);
app.use('/api/attendance', authenticateToken, attendanceRoutes);
app.use('/api/exams', authenticateToken, examRoutes);
app.use('/api/fees', authenticateToken, feeRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);

// Socket.IO for real-time features
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  const jwt = require('jsonwebtoken');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.schoolId = decoded.schoolId;
    socket.role = decoded.role;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);
  
  // Join school room for notifications
  socket.join(`school_${socket.schoolId}`);
  
  // Join user room for private messages
  socket.join(`user_${socket.userId}`);
  
  // Handle chat messages
  socket.on('send_message', async (data) => {
    try {
      const { receiverId, content, messageType = 'text' } = data;
      
      // Save message to database
      const { supabase } = require('./config/database');
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          sender_id: socket.userId,
          receiver_id: receiverId,
          school_id: socket.schoolId,
          content,
          message_type: messageType
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Send to receiver
      io.to(`user_${receiverId}`).emit('new_message', message);
      
      // Send confirmation to sender
      socket.emit('message_sent', message);
      
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(`user_${data.receiverId}`).emit('user_typing', {
      userId: socket.userId,
      isTyping: data.isTyping
    });
  });
  
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 3001;

console.log('🚀 Starting EduMesh API Server...');
console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔧 Port: ${PORT}`);

server.listen(PORT, () => {
  console.log(`🚀 EduMesh API Server running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;