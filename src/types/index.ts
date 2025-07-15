export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'teacher' | 'parent' | 'student';
  avatar?: string;
  schoolId?: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  region: string;
  adminEmail: string;
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  assignedClasses: string[];
  avatar?: string;
}

export interface Student {
  id: string;
  name: string;
  class: string;
  rollNumber: string;
  parentId: string;
  avatar?: string;
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  subject: string;
  day: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface Homework {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  classId: string;
  teacherId: string;
  attachments: string[];
  submitted: boolean;
}

export interface Exam {
  id: string;
  subject: string;
  class: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Fee {
  id: string;
  studentId: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  description: string;
}