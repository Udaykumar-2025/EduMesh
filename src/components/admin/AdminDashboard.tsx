import React from 'react';
import { Users, GraduationCap, BookOpen, TrendingUp, Calendar, AlertCircle, UserPlus } from 'lucide-react';
import Card from '../shared/Card';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const stats = [
    { title: 'Total Teachers', value: '24', icon: Users, color: 'bg-blue-500', change: '+2 this month' },
    { title: 'Total Students', value: '486', icon: GraduationCap, color: 'bg-green-500', change: '+12 this month' },
    { title: 'Active Classes', value: '18', icon: BookOpen, color: 'bg-purple-500', change: '3 ongoing' },
    { title: 'Attendance Rate', value: '94%', icon: TrendingUp, color: 'bg-orange-500', change: '+2% vs last month' }
  ];

  const recentActivities = [
    { action: 'New teacher registered', user: 'Sarah Johnson', time: '2 hours ago', type: 'teacher' },
    { action: 'Class schedule updated', user: 'Michael Chen', time: '4 hours ago', type: 'schedule' },
    { action: 'Exam scheduled', user: 'Emily Rodriguez', time: '6 hours ago', type: 'exam' },
    { action: 'Student enrolled', user: 'Alex Thompson', time: '1 day ago', type: 'student' }
  ];

  const upcomingEvents = [
    { title: 'Parent-Teacher Meeting', date: 'Jan 25, 2025', time: '2:00 PM' },
    { title: 'Science Fair', date: 'Feb 1, 2025', time: '10:00 AM' },
    { title: 'Annual Sports Day', date: 'Feb 15, 2025', time: '9:00 AM' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening at your school today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} hover className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  {activity.type === 'teacher' && <Users size={16} className="text-blue-600" />}
                  {activity.type === 'schedule' && <Calendar size={16} className="text-blue-600" />}
                  {activity.type === 'exam' && <BookOpen size={16} className="text-blue-600" />}
                  {activity.type === 'student' && <GraduationCap size={16} className="text-blue-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Add Event
            </button>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar size={16} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="text-xs text-gray-500">{event.date} at {event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Manage Users', icon: UserPlus, color: 'bg-blue-500', action: () => onNavigate('manage-users') },
            { label: 'Create Class', icon: BookOpen, color: 'bg-green-500', action: () => {} },
            { label: 'Schedule Exam', icon: Calendar, color: 'bg-purple-500' },
            { label: 'View Reports', icon: TrendingUp, color: 'bg-orange-500' }
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <Card key={index} hover className="p-4 text-center" onClick={action.action}>
                <div className={`w-12 h-12 ${action.color} rounded-lg mx-auto mb-3 flex items-center justify-center`}>
                  <Icon className="text-white" size={20} />
                </div>
                <p className="text-sm font-medium text-gray-900">{action.label}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}