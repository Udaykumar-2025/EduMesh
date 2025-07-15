import React, { useState } from 'react';
import { Mail, Phone, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (phone: string, method: 'phone' | 'email') => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onLogin(value, method);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              E
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to EduMesh</h1>
          <p className="text-blue-100">Connect your educational community</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex space-x-2 bg-white/10 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setMethod('phone')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-all ${
                  method === 'phone'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Phone size={16} />
                <span className="text-sm font-medium">Phone</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('email')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-all ${
                  method === 'email'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Mail size={16} />
                <span className="text-sm font-medium">Email</span>
              </button>
            </div>

            <div>
              <input
                type={method === 'email' ? 'email' : 'tel'}
                placeholder={method === 'email' ? 'Enter your email' : 'Enter your phone number'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              />
            </div>

            <button
              type="submit"
              disabled={!value.trim()}
              className="w-full bg-white text-blue-600 py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>Continue</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-blue-200">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}