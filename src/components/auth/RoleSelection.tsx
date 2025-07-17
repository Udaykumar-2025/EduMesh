import React, { useState } from 'react';
import { ShieldCheck, GraduationCap, Users, BookOpen } from 'lucide-react';
import { apiService } from '../../services/api';
import { User } from '../../types';

interface RoleSelectionProps {
  contact: string;
  method: 'phone' | 'email';
  onRoleSelect: (user: User) => void;
}

const roles = [
  {
    id: 'admin',
    title: 'School Admin',
    description: 'Manage school operations, teachers, and students',
    icon: ShieldCheck,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  {
    id: 'teacher',
    title: 'Teacher',
    description: 'Manage classes, assignments, and student progress',
    icon: GraduationCap,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  {
    id: 'parent',
    title: 'Parent',
    description: 'Monitor your child\'s academic progress and activities',
    icon: Users,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  {
    id: 'student',
    title: 'Student',
    description: 'Access your classes, assignments, and schedules',
    icon: BookOpen,
    color: 'from-orange-500 to-yellow-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600'
  }
];

export default function RoleSelection({ contact, method, onRoleSelect }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSchoolForm, setShowSchoolForm] = useState(false);
  const [schoolCode, setSchoolCode] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [userName, setUserName] = useState('');

  const handleContinue = async () => {
    if (!selectedRole) return;

    if (!showSchoolForm) {
      setShowSchoolForm(true);
      return;
    }

    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (selectedRole !== 'admin' && !schoolCode.trim()) {
      setError('Please enter school code');
      return;
    }

    if (selectedRole === 'admin' && !schoolCode.trim() && !schoolName.trim()) {
      setError('Please enter school code to join existing school or school name to create new school');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const registrationData = {
        name: userName,
        email: method === 'email' ? contact : `${userName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: method === 'phone' ? contact : '',
        role: selectedRole,
        ...(schoolCode && { schoolCode }),
        ...(schoolName && { schoolName })
      };

      const response = await apiService.register(registrationData);
      
      if (response.success && response.data) {
        const userData: User = {
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          phone: response.data.user.phone,
          role: response.data.user.role,
          schoolId: response.data.user.schoolId,
          avatar: response.data.user.avatar
        };
        
        // Store tokens
        if (response.data.refreshToken) {
          localStorage.setItem('edumesh_refresh_token', response.data.refreshToken);
        }
        
        onRoleSelect(userData);
      }
    } catch (error: any) {
      setError(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Choose Your Role</h1>
          <p className="text-blue-100">Select how you'll be using EduMesh</p>
        </div>

        {!showSchoolForm ? (
          <div className="space-y-4 mb-8">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`w-full p-6 rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 ${
                    isSelected
                      ? 'border-white bg-white/20 shadow-xl'
                      : 'border-white/20 bg-white/10 hover:bg-white/15'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${role.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-semibold text-white">{role.title}</h3>
                      <p className="text-blue-100 text-sm">{role.description}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 border-white transition-all ${
                      isSelected ? 'bg-white' : ''
                    }`}>
                      {isSelected && (
                        <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 scale-75" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Complete Your Registration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Your Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>

                {selectedRole === 'admin' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">School Code (Optional)</label>
                      <input
                        type="text"
                        value={schoolCode}
                        onChange={(e) => setSchoolCode(e.target.value)}
                        placeholder="Enter school code to join existing school"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                    </div>
                    <div className="text-center text-blue-200 text-sm">OR</div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">School Name (Create New)</label>
                      <input
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="Enter school name to create new school"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">School Code</label>
                    <input
                      type="text"
                      value={schoolCode}
                      onChange={(e) => setSchoolCode(e.target.value)}
                      placeholder="Enter your school code"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-200 text-sm text-center">{error}</p>
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={!selectedRole || isLoading}
          className="w-full bg-white text-blue-600 py-3 px-4 rounded-lg font-semibold hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          {isLoading ? 'Creating Account...' : showSchoolForm ? 'Create Account' : 'Continue'}
        </button>

        {showSchoolForm && (
          <button
            onClick={() => setShowSchoolForm(false)}
            className="w-full mt-3 text-white/70 hover:text-white transition-colors text-sm"
          >
            ← Back to Role Selection
          </button>
        )}
      </div>
    </div>
  );
}