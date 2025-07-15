import React from 'react';
import { BookOpen, Calendar, Clock, TrendingUp, MessageCircle, DollarSign } from 'lucide-react';
import Card from '../shared/Card';
import { mockHomework, mockExams } from '../../data/mockData';

export default function ParentDashboard() {
  const childName = "Alex Thompson";
  const todaysHomework = mockHomework.filter(hw => !hw.submitted);
  const upcomingExams = mockExams.filter(exam => exam.status === 'upcoming').slice(0, 2);

  const stats = [
    { title: 'Homework Pending', value: todaysHomework.length.toString(), icon: BookOpen, color: 'bg-orange-500' },
    { title: 'Attendance Rate', value: '96%', icon: TrendingUp, color: 'bg-green-500' },
    { title: 'Upcoming Exams', value: upcomingExams.length.toString(), icon: Calendar, color: 'bg-blue-500' },
    { title: 'Fees Due', value: '$1,200', icon: DollarSign, color: 'bg-red-500' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Parent Dashboard</h1>
        <p className="text-gray-600">Monitor {childName}'s academic progress</p>
      </div>

      {/* Child Profile Card */}
      <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{childName}</h2>
            <p className="text-gray-600">Class 10A • Roll No: 001</p>
            <p className="text-sm text-green-600 mt-1">Present today ✅</p>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} hover className="p-4">
              <div className="text-center">
                <div className={`w-12 h-12 ${stat.color} rounded-lg mx-auto mb-3 flex items-center justify-center`}>
                  <Icon className="text-white" size={20} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-600 mt-1">{stat.title}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Homework */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Pending Homework</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {todaysHomework.map((homework) => (
              <div key={homework.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{homework.title}</h3>
                    <p className="text-sm text-gray-600">{homework.subject}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-500">Due: {homework.dueDate}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                      Pending
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Exams */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Exams</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View Calendar
            </button>
          </div>
          <div className="space-y-4">
            {upcomingExams.map((exam) => (
              <div key={exam.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{exam.subject}</h3>
                    <p className="text-sm text-gray-600">{exam.class}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar size={12} />
                        <span>{exam.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span>{exam.startTime}</span>
                      </div>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 transition-colors">
                    Add to Calendar
                  </button>
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
            { label: 'Chat with Teacher', icon: MessageCircle, color: 'bg-blue-500' },
            { label: 'Pay Fees', icon: DollarSign, color: 'bg-green-500' },
            { label: 'View Reports', icon: TrendingUp, color: 'bg-purple-500' },
            { label: 'Attendance', icon: Calendar, color: 'bg-orange-500' }
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <Card key={index} hover className="p-4 text-center">
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