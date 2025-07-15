import React, { useState } from 'react';
import { ShieldCheck, GraduationCap, Users, BookOpen } from 'lucide-react';
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

  const handleContinue = () => {
    if (selectedRole) {
      const userData: User = {
        id: Date.now().toString(),
        name: 'Demo User',
        email: method === 'email' ? contact : 'user@example.com',
        phone: method === 'phone' ? contact : '',
        role: selectedRole as any
      };
      onRoleSelect(userData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Choose Your Role</h1>
          <p className="text-blue-100">Select how you'll be using EduMesh</p>
        </div>

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

        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className="w-full bg-white text-blue-600 py-3 px-4 rounded-lg font-semibold hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
}