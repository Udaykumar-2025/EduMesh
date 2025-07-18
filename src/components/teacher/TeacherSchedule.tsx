import React from 'react';
import { Clock, MapPin, Users } from 'lucide-react';
import Card from '../shared/Card';
import { mockClasses } from '../../data/mockData';

interface TeacherScheduleProps {
  onNavigate?: (view: string) => void;
}

export default function TeacherSchedule({ onNavigate }: TeacherScheduleProps) {
  const todaysClasses = mockClasses.filter(cls => cls.day === 'Monday');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return '⏰';
      case 'ongoing': return '🟢';
      case 'completed': return '✅';
      default: return '⏰';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Schedule</h1>
        <p className="text-gray-600">Today's classes and activities</p>
      </div>

      {/* Today's Overview */}
      <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Today, January 15, 2025</h2>
            <p className="text-gray-600">You have {todaysClasses.length} classes scheduled</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">{todaysClasses.length}</p>
            <p className="text-sm text-gray-500">Classes</p>
          </div>
        </div>
      </Card>

      {/* Classes List */}
      <div className="space-y-4">
        {todaysClasses.map((classItem, index) => (
          <Card key={classItem.id} hover className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {classItem.subject.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{classItem.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{classItem.startTime} - {classItem.endTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin size={14} />
                      <span>Room 101</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users size={14} />
                      <span>24 students</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(classItem.status)}`}>
                  {getStatusIcon(classItem.status)} {classItem.status.charAt(0).toUpperCase() + classItem.status.slice(1)}
                </span>
                
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    <span onClick={() => onNavigate?.('attendance')}>Take Attendance</span>
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                    Assign Homework
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card hover className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">View All Classes</h3>
            <p className="text-sm text-gray-600">See your complete schedule</p>
          </Card>
          
          <Card hover className="p-6 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <Clock className="text-white" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Manage Timetable</h3>
            <p className="text-sm text-gray-600">Update your schedule</p>
          </Card>
          
          <Card hover className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <MapPin className="text-white" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Room Bookings</h3>
            <p className="text-sm text-gray-600">Book additional rooms</p>
          </Card>
        </div>
      </div>
    </div>
  );
}