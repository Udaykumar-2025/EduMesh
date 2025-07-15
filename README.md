# EduMesh - School Management System

A comprehensive, modern school management system built with React, Node.js, and Supabase.

## 🚀 Features

### Frontend (React + Vite)
- **Multi-role Authentication**: Admin, Teacher, Parent, Student roles
- **Responsive Design**: Mobile-first approach with beautiful UI
- **Real-time Updates**: Live chat and notifications
- **Role-based Dashboards**: Customized experience for each user type
- **Modern UI/UX**: Gradient designs, smooth animations, and intuitive navigation

### Backend (Node.js + Express)
- **RESTful API**: Complete API with OpenAPI/Swagger documentation
- **Real-time Communication**: Socket.IO for chat and notifications
- **Multi-tenant Architecture**: School-based data isolation
- **Role-based Access Control**: Secure endpoints with JWT authentication
- **Comprehensive Modules**: Homework, Attendance, Exams, Fees, Chat

### Database (Supabase/PostgreSQL)
- **Robust Schema**: Well-designed relational database
- **Row Level Security**: Data isolation and security
- **Real-time Subscriptions**: Live data updates
- **Scalable Architecture**: Multi-school support

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, Socket.IO
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT with OTP verification
- **Documentation**: Swagger/OpenAPI 3.0
- **Deployment**: Netlify (Frontend), Railway/Heroku (Backend)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Install backend dependencies
cd server
npm install

# Copy environment variables
cp .env.example .env

# Configure your environment variables in .env
# Add your Supabase credentials

# Start development server
npm run dev
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Optional: Email/SMS providers for production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:3001/api-docs`
- **Health Check**: `http://localhost:3001/health`

## 🎯 Key Features by Role

### 👨‍💼 Admin Dashboard
- School management and configuration
- User management (teachers, students, parents)
- Timetable and class scheduling
- Exam management
- Fee structure setup
- Analytics and reports

### 👩‍🏫 Teacher Portal
- Class schedule management
- Homework assignment and tracking
- Attendance marking
- Student progress monitoring
- Parent communication
- Exam result entry

### 👨‍👩‍👧‍👦 Parent Dashboard
- Child's academic progress tracking
- Homework and assignment monitoring
- Attendance reports
- Fee payment and history
- Teacher communication
- Exam schedules and results

### 🎓 Student Portal
- Personal dashboard
- Homework submissions
- Class schedules
- Exam timetables
- Grade reports
- Communication tools

## 🔐 Authentication Flow

1. **Login/Registration**: Phone or email-based OTP verification
2. **Role Selection**: Choose user role (Admin/Teacher/Parent/Student)
3. **School Association**: Join existing school or create new (Admin only)
4. **Dashboard Access**: Role-based dashboard with appropriate features

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Supabase)    │
│                 │    │                 │    │                 │
│ • Auth          │    │ • REST API      │    │ • PostgreSQL    │
│ • Dashboards    │    │ • Socket.IO     │    │ • RLS Policies  │
│ • Real-time UI  │    │ • JWT Auth      │    │ • Real-time     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Deployment

### Frontend (Netlify)
```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Backend (Railway/Heroku)
```bash
# Set environment variables in your hosting platform
# Deploy server/ directory
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@edumesh.com or join our Discord community.

## 🎉 Demo

Visit our live demo: [https://edumesh-demo.netlify.app](https://lucent-liger-720ef4.netlify.app)

**Demo Credentials:**
- Use any phone/email for login
- OTP: `123456` (for demo purposes)
- Try different roles to explore features
