import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginScreen from './components/auth/LoginScreen';
import FirstTimeSetup from './components/auth/FirstTimeSetup';
import Layout from './components/shared/Layout';
import AdminDashboard from './components/admin/AdminDashboard';
import TeacherSchedule from './components/teacher/TeacherSchedule';
import ParentDashboard from './components/parent/ParentDashboard';
import StudentTeacherManagement from './components/admin/StudentTeacherManagement';
import AttendanceCapture from './components/teacher/AttendanceCapture';
import { User } from './types';

function App() {
  const { user, isLoading, login, logout, completeFirstTimeSetup } = useAuth();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [error, setError] = useState('');

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

  // First time setup for default admin
  if (user?.isFirstTime) {
    return <FirstTimeSetup onComplete={completeFirstTimeSetup} />;
  }

  // Authentication flow
  if (!user) {
    const handleLogin = async (schoolId: string, userId: string) => {
      try {
        setError('');
        await login(schoolId, userId);
      } catch (error: any) {
        setError(error.message || 'Login failed');
      }
    };

    return (
      <div>
        <LoginScreen onLogin={handleLogin} />
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
            {error}
          </div>
        )}
      </div>
    );
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
              <p className="text-gray-600">Welcome, {user.name}!</p>
              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <p className="text-blue-800">Your student portal is being prepared. Check back soon!</p>
              </div>
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
    setError('');
  }
}

export default App;