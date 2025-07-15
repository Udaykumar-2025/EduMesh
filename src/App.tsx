import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Layout from './components/shared/Layout';
import LoginScreen from './components/auth/LoginScreen';
import OTPScreen from './components/auth/OTPScreen';
import RoleSelection from './components/auth/RoleSelection';
import AdminDashboard from './components/admin/AdminDashboard';
import TeacherSchedule from './components/teacher/TeacherSchedule';
import ParentDashboard from './components/parent/ParentDashboard';
import { User } from './types';

type AuthStep = 'login' | 'otp' | 'role';

function App() {
  const { user, isLoading, login, logout } = useAuth();
  const [authStep, setAuthStep] = useState<AuthStep>('login');
  const [tempContact, setTempContact] = useState('');
  const [tempMethod, setTempMethod] = useState<'phone' | 'email'>('phone');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              E
            </span>
          </div>
          <p className="text-white">Loading EduMesh...</p>
        </div>
      </div>
    );
  }

  const handleLogin = (contact: string, method: 'phone' | 'email') => {
    setTempContact(contact);
    setTempMethod(method);
    setAuthStep('otp');
  };

  const handleOTPVerify = () => {
    setAuthStep('role');
  };

  const handleRoleSelect = (userData: User) => {
    login(userData);
  };

  const renderAuthScreen = () => {
    switch (authStep) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'otp':
        return (
          <OTPScreen
            contact={tempContact}
            method={tempMethod}
            onVerify={handleOTPVerify}
            onBack={() => setAuthStep('login')}
          />
        );
      case 'role':
        return (
          <RoleSelection
            contact={tempContact}
            method={tempMethod}
            onRoleSelect={handleRoleSelect}
          />
        );
    }
  };

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
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
  };

  if (!user) {
    return renderAuthScreen();
  }

  return (
    <Layout user={user} onLogout={logout}>
      {renderDashboard()}
    </Layout>
  );
}

export default App;