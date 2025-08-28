import React, { useState } from 'react';
import { ArrowRight, Building, User, Eye, EyeOff } from 'lucide-react';
import loginBg from '../../assets/Login screen image.png';

interface LoginScreenProps {
  onLogin: (schoolId: string, userId: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [schoolId, setSchoolId] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId.trim() || !userId.trim()) {
      setError('Please enter both School ID and User ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      onLogin(schoolId.trim(), userId.trim());
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (demoSchoolId: string, demoUserId: string) => {
    setSchoolId(demoSchoolId);
    setUserId(demoUserId);
    onLogin(demoSchoolId, demoUserId);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
      style={{
        backgroundImage: `url(${loginBg})`,
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-blue-900/30" />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Yukti
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Green Wood High International</h1>
          <p className="text-blue-100">Connect With Your School</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                School ID
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200" size={18} />
                <input
                  type="text"
                  placeholder="Enter your school ID"
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                User ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200" size={18} />
                <input
                  type="text"
                  placeholder="Enter your user ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-200 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!schoolId.trim() || !userId.trim() || isLoading}
              className="w-full bg-white text-blue-600 py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-blue-200">or</span>
              </div>
            </div>

            <button
              onClick={() => setShowDemo(!showDemo)}
              className="w-full mt-4 text-white/70 hover:text-white transition-colors text-sm flex items-center justify-center space-x-2"
            >
              {showDemo ? <EyeOff size={16} /> : <Eye size={16} />}
              <span>{showDemo ? 'Hide' : 'Show'} Demo Accounts</span>
            </button>

            {showDemo && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-blue-200 text-center mb-3">Demo Accounts (Click to login)</p>
                
                <button
                  onClick={() => handleDemoLogin('greenwood', 'greenwood-admin-001')}
                  className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white transition-all text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">A</span>
                    </div>
                    <div>
                      <p className="font-medium">School Admin</p>
                      <p className="text-xs text-blue-200">greenwood-admin-001</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleDemoLogin('greenwood', 'greenwood-teacher-001')}
                  className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white transition-all text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">T</span>
                    </div>
                    <div>
                      <p className="font-medium">Teacher</p>
                      <p className="text-xs text-blue-200">greenwood-teacher-001</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleDemoLogin('greenwood', 'greenwood-parent-001')}
                  className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white transition-all text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <div>
                      <p className="font-medium">Parent</p>
                      <p className="text-xs text-blue-200">greenwood-parent-001</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleDemoLogin('greenwood', 'greenwood-student-001')}
                  className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white transition-all text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">S</span>
                    </div>
                    <div>
                      <p className="font-medium">Student</p>
                      <p className="text-xs text-blue-200">greenwood-student-001</p>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-blue-200">
              First time? Use <span className="font-medium">default-admin</span> to create your school
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
