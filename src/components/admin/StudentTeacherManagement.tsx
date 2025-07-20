import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Users, GraduationCap, Search, Edit, Trash2, Save, X, Upload } from 'lucide-react';
import Card from '../shared/Card';
import { dbOperations, Student, Teacher } from '../../lib/supabase';
import BulkUpload from './BulkUpload';

interface StudentTeacherManagementProps {
  onBack: () => void;
}

export default function StudentTeacherManagement({ onBack }: StudentTeacherManagementProps) {
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingItem, setEditingItem] = useState<Student | Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const schoolId = '550e8400-e29b-41d4-a716-446655440000'; // Demo school ID
  const [subjects, setSubjects] = useState<any[]>([
    { id: '1', name: 'Mathematics', code: 'MATH' },
    { id: '2', name: 'English', code: 'ENG' },
    { id: '3', name: 'Science', code: 'SCI' },
    { id: '4', name: 'History', code: 'HIST' },
    { id: '5', name: 'Physics', code: 'PHY' },
    { id: '6', name: 'Chemistry', code: 'CHEM' },
    { id: '7', name: 'Biology', code: 'BIO' }
  ]);

  // Form states
  const [studentForm, setStudentForm] = useState<Student>({
    school_id: schoolId,
    name: '',
    email: '',
    phone: undefined,
    student_id: '',
    class_name: '',
    roll_number: '',
    date_of_birth: '',
    parent_name: '',
    parent_email: '',
    parent_phone: ''
  });

  const [teacherForm, setTeacherForm] = useState<Teacher>({
    school_id: schoolId,
    name: '',
    email: '',
    phone: undefined,
    employee_id: '',
    qualification: undefined,
    experience_years: undefined,
    subjects: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [studentsData, teachersData] = await Promise.all([
        dbOperations.getStudents(schoolId),
        dbOperations.getTeachers(schoolId)
      ]);
      
      // Transform data to match our interface
      const transformedStudents = studentsData.map((s: any) => ({
        id: s.id,
        school_id: s.school_id,
        name: s.users?.name || '',
        email: s.users?.email || '',
        phone: s.users?.phone || '',
        student_id: s.student_id,
        class_name: s.class_name,
        roll_number: s.roll_number,
        date_of_birth: s.date_of_birth,
        parent_name: '', // We'll need to fetch parent data separately
        parent_email: '',
        parent_phone: ''
      }));
      
      const transformedTeachers = teachersData.map((t: any) => ({
        id: t.id,
        school_id: t.school_id,
        name: t.users?.name || '',
        email: t.users?.email || '',
        phone: t.users?.phone || '',
        employee_id: t.employee_id,
        qualification: t.qualification,
        experience_years: t.experience_years,
        subjects: t.subjects || []
      }));
      
      setStudents(transformedStudents);
      setTeachers(transformedTeachers);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data. Please check your database connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!studentForm.name || !studentForm.email || !studentForm.student_id ||
        !studentForm.class_name || !studentForm.roll_number) {
      alert('Please fill in all required fields');
      return;
    }

    // Check for duplicate student ID
    if (students.some(s => s.student_id === studentForm.student_id)) {
      alert('Student ID already exists');
      return;
    }

    setIsLoading(true);
    try {
      await dbOperations.addStudent(studentForm);
      await loadData(); // Reload data to show the new student
      alert('Student added successfully!');
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Error adding student. Please try again.');
    } finally {
      setIsLoading(false);
    }
    setShowAddForm(false);
    resetStudentForm();
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!teacherForm.name || !teacherForm.email || !teacherForm.employee_id) {
      alert('Please fill in all required fields');
      return;
    }

    // Check for duplicate employee ID
    if (teachers.some(t => t.employee_id === teacherForm.employee_id)) {
      alert('Employee ID already exists');
      return;
    }

    setIsLoading(true);
    try {
      await dbOperations.addTeacher(teacherForm);
      await loadData(); // Reload data to show the new teacher
      alert('Teacher added successfully!');
    } catch (error) {
      console.error('Error adding teacher:', error);
      alert('Error adding teacher. Please try again.');
    } finally {
      setIsLoading(false);
    }
    setShowAddForm(false);
    resetTeacherForm();
  };

  const resetStudentForm = () => {
    setStudentForm({
      school_id: schoolId,
      name: '',
      email: '',
      phone: undefined,
      student_id: '',
      class_name: '',
      roll_number: '',
      date_of_birth: '',
      parent_name: '',
      parent_email: '',
      parent_phone: ''
    });
  };

  const resetTeacherForm = () => {
    setTeacherForm({
      school_id: schoolId,
      name: '',
      email: '',
      phone: undefined,
      employee_id: '',
      qualification: undefined,
      experience_years: undefined,
      subjects: []
    });
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowBulkUpload(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload size={20} />
            <span>Bulk Upload</span>
          </button>
          <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add {activeTab === 'students' ? 'Student' : 'Teacher'}</span>
        </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
            activeTab === 'students'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <GraduationCap size={18} />
          <span>Students ({students.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('teachers')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
            activeTab === 'teachers'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users size={18} />
          <span>Teachers ({teachers.length})</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
      activeTab === 'students' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.id || student.student_id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <GraduationCap className="text-white" size={20} />
                </div>
                <div className="flex space-x-2">
                  <button className="p-1 text-gray-400 hover:text-blue-600">
                    <Edit size={16} />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{student.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{student.email}</p>
              <div className="space-y-1 text-xs text-gray-500">
                <p>ID: {student.student_id}</p>
                <p>Class: {student.class_name}</p>
                <p>Roll: {student.roll_number}</p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <Card key={teacher.id || teacher.employee_id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Users className="text-white" size={20} />
                </div>
                <div className="flex space-x-2">
                  <button className="p-1 text-gray-400 hover:text-blue-600">
                    <Edit size={16} />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{teacher.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{teacher.email}</p>
              <div className="space-y-1 text-xs text-gray-500">
                <p>ID: {teacher.employee_id}</p>
                <p>Experience: {teacher.experience_years || 0} years</p>
                <p>Qualification: {teacher.qualification}</p>
                <p>Subjects: {teacher.subjects.map(subjectId => 
                  subjects.find(s => s.id === subjectId)?.name
                ).filter(Boolean).join(', ')}</p>
              </div>
            </Card>
          ))}
        </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  Add New {activeTab === 'students' ? 'Student' : 'Teacher'}
                </h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {activeTab === 'students' ? (
                <form onSubmit={handleAddStudent} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Student Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={studentForm.name}
                        onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={studentForm.email}
                        onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={studentForm.phone}
                        onChange={(e) => setStudentForm({...studentForm, phone: e.target.value || undefined})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Student ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={studentForm.student_id}
                        onChange={(e) => setStudentForm({...studentForm, student_id: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Class *
                      </label>
                      <select
                        required
                        value={studentForm.class_name}
                        onChange={(e) => setStudentForm({...studentForm, class_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Class</option>
                        <option value="9A">9A</option>
                        <option value="9B">9B</option>
                        <option value="10A">10A</option>
                        <option value="10B">10B</option>
                        <option value="11A">11A</option>
                        <option value="11B">11B</option>
                        <option value="12A">12A</option>
                        <option value="12B">12B</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Roll Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={studentForm.roll_number}
                        onChange={(e) => setStudentForm({...studentForm, roll_number: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={studentForm.date_of_birth}
                        onChange={(e) => setStudentForm({...studentForm, date_of_birth: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Parent Information (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Parent Name
                        </label>
                        <input
                          type="text"
                          value={studentForm.parent_name}
                          onChange={(e) => setStudentForm({...studentForm, parent_name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Parent Email
                        </label>
                        <input
                          type="email"
                          value={studentForm.parent_email}
                          onChange={(e) => setStudentForm({...studentForm, parent_email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Parent Phone
                        </label>
                        <input
                          type="tel"
                          value={studentForm.parent_phone}
                          onChange={(e) => setStudentForm({...studentForm, parent_phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Save size={16} />
                      <span>Add Student</span>
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAddTeacher} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teacher Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={teacherForm.name}
                        onChange={(e) => setTeacherForm({...teacherForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={teacherForm.email}
                        onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={teacherForm.phone}
                        onChange={(e) => setTeacherForm({...teacherForm, phone: e.target.value || undefined})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={teacherForm.employee_id}
                        onChange={(e) => setTeacherForm({...teacherForm, employee_id: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Qualification
                      </label>
                      <input
                        type="text"
                        value={teacherForm.qualification}
                        onChange={(e) => setTeacherForm({...teacherForm, qualification: e.target.value || undefined})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Experience (Years)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={teacherForm.experience_years}
                        onChange={(e) => setTeacherForm({...teacherForm, experience_years: parseInt(e.target.value) || undefined})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subjects
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {subjects.map((subject) => (
                        <label key={subject.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={teacherForm.subjects.includes(subject.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTeacherForm({
                                  ...teacherForm,
                                  subjects: [...teacherForm.subjects, subject.id]
                                });
                              } else {
                                setTeacherForm({
                                  ...teacherForm,
                                  subjects: teacherForm.subjects.filter(id => id !== subject.id)
                                });
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{subject.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Save size={16} />
                      <span>Add Teacher</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkUpload
          type={activeTab}
          schoolId={schoolId}
          onClose={() => setShowBulkUpload(false)}
          onSuccess={() => {
            setShowBulkUpload(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}