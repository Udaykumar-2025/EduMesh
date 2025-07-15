import React, { useState } from 'react';
import { Home, Users, Calendar, MessageCircle, CreditCard, BookOpen, ClipboardList, UserCheck } from 'lucide-react';

interface BottomNavigationProps {
  userRole: 'admin' | 'teacher' | 'parent' | 'student';
}

export default function BottomNavigation({ userRole }: BottomNavigationProps) {
  const [activeTab, setActiveTab] = useState(0);

  const getTabsForRole = () => {
    switch (userRole) {
      case 'admin':
        return [
          { icon: Home, label: 'Dashboard', id: 'dashboard' },
          { icon: Users, label: 'Teachers', id: 'teachers' },
          { icon: Calendar, label: 'Timetable', id: 'timetable' },
          { icon: ClipboardList, label: 'Exams', id: 'exams' },
        ];
      case 'teacher':
        return [
          { icon: Calendar, label: 'Schedule', id: 'schedule' },
          { icon: BookOpen, label: 'Homework', id: 'homework' },
          { icon: UserCheck, label: 'Attendance', id: 'attendance' },
          { icon: MessageCircle, label: 'Messages', id: 'messages' },
        ];
      case 'parent':
        return [
          { icon: Home, label: 'Dashboard', id: 'dashboard' },
          { icon: BookOpen, label: 'Homework', id: 'homework' },
          { icon: Calendar, label: 'Exams', id: 'exams' },
          { icon: MessageCircle, label: 'Chat', id: 'chat' },
          { icon: CreditCard, label: 'Fees', id: 'fees' },
        ];
      default:
        return [
          { icon: Home, label: 'Home', id: 'home' },
          { icon: BookOpen, label: 'Classes', id: 'classes' },
          { icon: Calendar, label: 'Schedule', id: 'schedule' },
        ];
    }
  };

  const tabs = getTabsForRole();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === index;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(index)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                isActive
                  ? 'text-blue-600 transform scale-105'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon
                size={20}
                className={`transition-all duration-200 ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              />
              <span
                className={`text-xs mt-1 transition-all duration-200 ${
                  isActive ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-b-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}