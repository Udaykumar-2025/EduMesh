import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginScreen from './components/auth/LoginScreen';
import OTPScreen from './components/auth/OTPScreen';
import RoleSelection from './components/auth/RoleSelection';
import Layout from './components/shared/Layout';
import AdminDashboard from './components/admin/AdminDashboard';
import TeacherSchedule from './components/teacher/TeacherSchedule';
import ParentDashboard from './components/parent/ParentDashboard';
import StudentTeacherManagement from './components/admin/StudentTeacherManagement';
import AttendanceCapture from './components/teacher/AttendanceCapture';
import { User } from './types';

// Dummy users for quick demo login
const dummyUsers: Record<string, User> = {
  admin: {
    id: '550e8400-e29b-41d4-a716-446655440010',
    name: 'Dr. Sarah Wilson',
    email: 'admin@greenwood.edu',
    phone: '+1-555-0100',
    role: 'admin',
    schoolId: '550e8400-e29b-41d4-a716-446655440000',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=150'
  },
  teacher: {
    id: '550e8400-e29b-41d4-a716-446655440011',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@greenwood.edu',
    phone: '+1-555-0101',
    role: 'teacher',
    schoolId: '550e8400-e29b-41d4-a716-446655440000',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=150'
  },
  parent: {
    id: '550e8400-e29b-41d4-a716-446655440020',
    name: 'John Thompson',
    email: 'parent1@example.com',
    phone: '+1-555-0201',
    role: 'parent',
    schoolId: '550e8400-e29b-41d4-a716-446655440000',
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?w=150'
  },
  student: {
    id: '550e8400-e29b-41d4-a716-446655440030',
    name: 'Alex Thompson',
    email: 'alex.thompson@student.greenwood.edu',
    phone: '+1-555-0301',
    role: 'student',
    schoolId: '550e8400-e29b-41d4-a716-446655440000',
    avatar: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?w=150'
  }
};

function App() {
  const { user, isLoading, login, logout } = useAuth();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [authStep, setAuthStep] = useState<'login' | 'otp' | 'role'>('login');
  const [authContact, setAuthContact] = useState('');
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [showDummyLogin, setShowDummyLogin] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              E
            </span>
          </div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Authentication flow
  if (!user) {
    // Dummy login for demo purposes
    if (showDummyLogin) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  E
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Demo Login</h1>
              <p className="text-blue-100">Select a role to demo the system</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="space-y-3 mb-6">
                {Object.entries(dummyUsers).map(([role, userData]) => (
                  <button
                    key={role}
                    onClick={() => login(userData)}
                    className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white transition-all hover:scale-105"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{userData.name.charAt(0)}</span>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">{userData.name}</p>
                        <p className="text-sm text-blue-200 capitalize">{userData.role}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowDummyLogin(false)}
                className="w-full text-white/70 hover:text-white transition-colors text-sm"
              >
                ← Back to Real Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Real authentication flow
    if (authStep === 'login') {
      return (
        <div>
          <LoginScreen 
            onLogin={(contact, method) => {
              setAuthContact(contact);
              setAuthMethod(method);
              setAuthStep('otp');
            }}
          />
          {/* Demo Login Button */}
          <button
            onClick={() => setShowDummyLogin(true)}
            className="fixed bottom-4 right-4 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg border border-white/30 hover:bg-white/30 transition-all text-sm"
          >
            Demo Login
          </button>
        </div>
      );
    }

    if (authStep === 'otp') {
      return (
        <OTPScreen
          contact={authContact}
          method={authMethod}
          onVerify={() => setAuthStep('role')}
          onBack={() => setAuthStep('login')}
        />
      );
    }

    if (authStep === 'role') {
      return (
        <RoleSelection
          contact={authContact}
          method={authMethod}
          onRoleSelect={(userData) => {
            login(userData);
            setAuthStep('login'); // Reset for next time
          }}
        />
      );
    }
  }

  // Main application
  return (
    <Layout user={user} onLogout={handleLogout}>
      {renderDashboard()}
    </Layout>
  );

  function renderDashboard() {
    if (user.role === 'admin') {
      switch (currentView) {
        case 'dashboard':
          return <AdminDashboard onNavigate={setCurrentView} />;
        case 'manage-users':
          return <StudentTeacherManagement onBack={() => setCurrentView('dashboard')} />;
        default:
          return <AdminDashboard onNavigate={setCurrentView} />;
      }
    } else {
      switch (user?.role) {
        case 'teacher':
          switch (currentView) {
            case 'dashboard':
              return <TeacherSchedule onNavigate={setCurrentView} />;
            case 'attendance':
              return <AttendanceCapture onBack={() => setCurrentView('dashboard')} />;
            default:
              return <TeacherSchedule onNavigate={setCurrentView} />;
          }
        case 'parent':
          return <ParentDashboard />;
        case 'student':
          return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Student Dashboard</h1>
              <p className="text-gray-600">Student features coming soon!</p>
            </div>
          );
        default:
          return null;
      }
    }
  }

  function handleLogout() {
    logout();
    setCurrentView('dashboard');
  }
}

export default App;