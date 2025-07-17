import React, { useState } from 'react';
import Layout from './components/shared/Layout';
import AdminDashboard from './components/admin/AdminDashboard';
import TeacherSchedule from './components/teacher/TeacherSchedule';
import ParentDashboard from './components/parent/ParentDashboard';
import StudentTeacherManagement from './components/admin/StudentTeacherManagement';
import { User } from './types';

// Dummy users for demo
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
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Demo login screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                E
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">EduMesh Demo</h1>
            <p className="text-blue-100">Select a role to demo the system</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="space-y-3">
              {Object.entries(dummyUsers).map(([role, userData]) => (
                <button
                  key={role}
                  onClick={() => setUser(userData)}
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
          </div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
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
          return <TeacherSchedule />;
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
  };

  const logout = () => {
    setUser(null);
    setCurrentView('dashboard');
  };

  return (
    <Layout user={user} onLogout={logout}>
      {renderDashboard()}
    </Layout>
  );
}

export default App;