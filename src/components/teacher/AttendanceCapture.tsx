import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Calendar, Clock, Save, Lock, Edit3, Check, X, UserCheck, UserX, AlertCircle } from 'lucide-react';
import Card from '../shared/Card';

interface AttendanceCaptureProps {
  onBack: () => void;
}

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  avatar?: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

interface AttendanceSession {
  id: string;
  className: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  students: Student[];
  isFrozen: boolean;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
}

export default function AttendanceCapture({ onBack }: AttendanceCaptureProps) {
  const [currentSession, setCurrentSession] = useState<AttendanceSession | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  // Mock data for demo
  const classes = [
    { id: '1', name: '10A', subject: 'Mathematics', time: '09:00 - 10:00' },
    { id: '2', name: '10B', subject: 'Mathematics', time: '10:30 - 11:30' },
    { id: '3', name: '11A', subject: 'Physics', time: '14:00 - 15:00' }
  ];

  const mockStudents: Student[] = [
    { id: '1', name: 'Alex Thompson', rollNumber: '001', status: 'present', avatar: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?w=150' },
    { id: '2', name: 'Emma Wilson', rollNumber: '002', status: 'present', avatar: 'https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?w=150' },
    { id: '3', name: 'James Davis', rollNumber: '003', status: 'late', notes: 'Arrived 10 minutes late', avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?w=150' },
    { id: '4', name: 'Sophie Chen', rollNumber: '004', status: 'present', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=150' },
    { id: '5', name: 'Michael Brown', rollNumber: '005', status: 'absent', notes: 'Sick leave', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=150' },
    { id: '6', name: 'Lisa Garcia', rollNumber: '006', status: 'present', avatar: 'https://images.pexels.com/photos/3755755/pexels-photo-3755755.jpeg?w=150' },
    { id: '7', name: 'David Kim', rollNumber: '007', status: 'excused', notes: 'Medical appointment', avatar: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?w=150' },
    { id: '8', name: 'Sarah Johnson', rollNumber: '008', status: 'present', avatar: 'https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?w=150' }
  ];

  useEffect(() => {
    if (selectedClass) {
      loadAttendanceSession();
    }
  }, [selectedClass]);

  const loadAttendanceSession = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const classInfo = classes.find(c => c.id === selectedClass);
      if (classInfo) {
        const session: AttendanceSession = {
          id: `session_${Date.now()}`,
          className: classInfo.name,
          subject: classInfo.subject,
          date: new Date().toISOString().split('T')[0],
          startTime: classInfo.time.split(' - ')[0],
          endTime: classInfo.time.split(' - ')[1],
          students: mockStudents,
          isFrozen: false,
          totalStudents: mockStudents.length,
          presentCount: mockStudents.filter(s => s.status === 'present').length,
          absentCount: mockStudents.filter(s => s.status === 'absent').length,
          lateCount: mockStudents.filter(s => s.status === 'late').length,
          excusedCount: mockStudents.filter(s => s.status === 'excused').length
        };
        setCurrentSession(session);
        setShowSummary(true);
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleQuickAttendance = () => {
    if (!currentSession) return;
    
    setIsLoading(true);
    
    // Simulate one-click attendance (mark all present)
    setTimeout(() => {
      const updatedStudents = currentSession.students.map(student => ({
        ...student,
        status: 'present' as const
      }));
      
      const updatedSession = {
        ...currentSession,
        students: updatedStudents,
        presentCount: updatedStudents.length,
        absentCount: 0,
        lateCount: 0,
        excusedCount: 0
      };
      
      setCurrentSession(updatedSession);
      setIsLoading(false);
    }, 500);
  };

  const updateStudentStatus = (studentId: string, status: Student['status'], notes?: string) => {
    if (!currentSession || currentSession.isFrozen) return;

    const updatedStudents = currentSession.students.map(student =>
      student.id === studentId ? { ...student, status, notes: notes || '' } : student
    );

    const updatedSession = {
      ...currentSession,
      students: updatedStudents,
      presentCount: updatedStudents.filter(s => s.status === 'present').length,
      absentCount: updatedStudents.filter(s => s.status === 'absent').length,
      lateCount: updatedStudents.filter(s => s.status === 'late').length,
      excusedCount: updatedStudents.filter(s => s.status === 'excused').length
    };

    setCurrentSession(updatedSession);
  };

  const freezeAttendance = () => {
    if (!currentSession) return;
    
    setCurrentSession({
      ...currentSession,
      isFrozen: true
    });
    
    // Simulate saving to database
    alert('Attendance has been frozen and saved successfully!');
  };

  const unfreezeAttendance = () => {
    if (!currentSession) return;
    
    setCurrentSession({
      ...currentSession,
      isFrozen: false
    });
  };

  const getStatusColor = (status: Student['status']) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'excused': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Student['status']) => {
    switch (status) {
      case 'present': return <UserCheck size={16} className="text-green-600" />;
      case 'absent': return <UserX size={16} className="text-red-600" />;
      case 'late': return <Clock size={16} className="text-yellow-600" />;
      case 'excused': return <AlertCircle size={16} className="text-blue-600" />;
      default: return <Users size={16} className="text-gray-600" />;
    }
  };

  if (!selectedClass) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Take Attendance</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <Card key={classItem.id} hover className="p-6" onClick={() => setSelectedClass(classItem.id)}>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Class {classItem.name}</h3>
                <p className="text-gray-600 mb-1">{classItem.subject}</p>
                <p className="text-sm text-gray-500">{classItem.time}</p>
                <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Take Attendance
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedClass('')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Classes</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Attendance - Class {currentSession.className}
            </h1>
            <p className="text-gray-600">
              {currentSession.subject} • {new Date(currentSession.date).toLocaleDateString()} • {currentSession.startTime} - {currentSession.endTime}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {currentSession.isFrozen ? (
            <div className="flex items-center space-x-2 text-green-600">
              <Lock size={20} />
              <span className="font-medium">Frozen</span>
            </div>
          ) : (
            <>
              <button
                onClick={handleQuickAttendance}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Check size={16} />
                <span>Mark All Present</span>
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 size={16} />
                <span>{isEditing ? 'View Mode' : 'Edit Mode'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Attendance Summary */}
      {showSummary && (
        <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{currentSession.totalStudents}</p>
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{currentSession.presentCount}</p>
              <p className="text-sm text-gray-600">Present</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{currentSession.absentCount}</p>
              <p className="text-sm text-gray-600">Absent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{currentSession.lateCount}</p>
              <p className="text-sm text-gray-600">Late</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{currentSession.excusedCount}</p>
              <p className="text-sm text-gray-600">Excused</p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-center">
            {currentSession.isFrozen ? (
              <button
                onClick={unfreezeAttendance}
                className="flex items-center space-x-2 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Edit3 size={16} />
                <span>Unfreeze & Edit</span>
              </button>
            ) : (
              <button
                onClick={freezeAttendance}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Lock size={16} />
                <span>Freeze Attendance</span>
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Students List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentSession.students.map((student) => (
          <Card key={student.id} className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                {student.avatar ? (
                  <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold">{student.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{student.name}</h3>
                <p className="text-sm text-gray-500">Roll: {student.rollNumber}</p>
                {student.notes && (
                  <p className="text-xs text-gray-400 mt-1">{student.notes}</p>
                )}
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
                  {getStatusIcon(student.status)}
                  <span className="capitalize">{student.status}</span>
                </div>
                
                {isEditing && !currentSession.isFrozen && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => updateStudentStatus(student.id, 'present')}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                      title="Present"
                    >
                      <UserCheck size={14} />
                    </button>
                    <button
                      onClick={() => updateStudentStatus(student.id, 'absent')}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Absent"
                    >
                      <UserX size={14} />
                    </button>
                    <button
                      onClick={() => updateStudentStatus(student.id, 'late')}
                      className="p-1 text-yellow-600 hover:bg-yellow-100 rounded"
                      title="Late"
                    >
                      <Clock size={14} />
                    </button>
                    <button
                      onClick={() => updateStudentStatus(student.id, 'excused')}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Excused"
                    >
                      <AlertCircle size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing attendance...</p>
          </div>
        </div>
      )}
    </div>
  );
}