import { Teacher, Student, Class, Homework, Exam, Message, Fee } from '../types';

export const mockTeachers: Teacher[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@school.edu',
    subjects: ['Mathematics', 'Physics'],
    assignedClasses: ['10A', '11B'],
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=150'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@school.edu',
    subjects: ['English', 'Literature'],
    assignedClasses: ['9A', '10B'],
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=150'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@school.edu',
    subjects: ['Biology', 'Chemistry'],
    assignedClasses: ['11A', '12A'],
    avatar: 'https://images.pexels.com/photos/3755755/pexels-photo-3755755.jpeg?w=150'
  }
];

export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Alex Thompson',
    class: '10A',
    rollNumber: '001',
    parentId: 'parent1',
    avatar: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?w=150'
  },
  {
    id: '2',
    name: 'Emma Wilson',
    class: '10A',
    rollNumber: '002',
    parentId: 'parent2',
    avatar: 'https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?w=150'
  },
  {
    id: '3',
    name: 'James Davis',
    class: '10A',
    rollNumber: '003',
    parentId: 'parent3',
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?w=150'
  }
];

export const mockClasses: Class[] = [
  {
    id: '1',
    name: '10A - Mathematics',
    teacherId: '1',
    subject: 'Mathematics',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    status: 'upcoming'
  },
  {
    id: '2',
    name: '10A - English',
    teacherId: '2',
    subject: 'English',
    day: 'Monday',
    startTime: '10:30',
    endTime: '11:30',
    status: 'upcoming'
  },
  {
    id: '3',
    name: '11A - Biology',
    teacherId: '3',
    subject: 'Biology',
    day: 'Monday',
    startTime: '14:00',
    endTime: '15:00',
    status: 'upcoming'
  }
];

export const mockHomework: Homework[] = [
  {
    id: '1',
    title: 'Quadratic Equations Exercise',
    subject: 'Mathematics',
    description: 'Complete exercises 1-20 from chapter 4. Show all working steps.',
    dueDate: '2025-01-20',
    classId: '1',
    teacherId: '1',
    attachments: ['math_worksheet.pdf'],
    submitted: false
  },
  {
    id: '2',
    title: 'Romeo and Juliet Essay',
    subject: 'English',
    description: 'Write a 500-word essay on the theme of love in Romeo and Juliet.',
    dueDate: '2025-01-22',
    classId: '2',
    teacherId: '2',
    attachments: [],
    submitted: true
  },
  {
    id: '3',
    title: 'Cell Structure Diagram',
    subject: 'Biology',
    description: 'Draw and label a detailed diagram of plant and animal cells.',
    dueDate: '2025-01-25',
    classId: '3',
    teacherId: '3',
    attachments: ['cell_template.pdf'],
    submitted: false
  }
];

export const mockExams: Exam[] = [
  {
    id: '1',
    subject: 'Mathematics',
    class: '10A',
    date: '2025-01-30',
    startTime: '09:00',
    endTime: '12:00',
    location: 'Room 101',
    status: 'upcoming'
  },
  {
    id: '2',
    subject: 'English',
    class: '10A',
    date: '2025-02-02',
    startTime: '14:00',
    endTime: '17:00',
    location: 'Room 205',
    status: 'upcoming'
  },
  {
    id: '3',
    subject: 'Biology',
    class: '11A',
    date: '2025-02-05',
    startTime: '10:00',
    endTime: '13:00',
    location: 'Science Lab',
    status: 'upcoming'
  }
];

export const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'parent1',
    receiverId: '1',
    content: 'Hi Ms. Johnson, I wanted to discuss Alex\'s progress in mathematics.',
    timestamp: '2025-01-15T10:30:00Z',
    read: true
  },
  {
    id: '2',
    senderId: '1',
    receiverId: 'parent1',
    content: 'Hello! Alex is doing well. Would you like to schedule a meeting?',
    timestamp: '2025-01-15T14:20:00Z',
    read: true
  },
  {
    id: '3',
    senderId: 'parent1',
    receiverId: '1',
    content: 'That would be great. What time works best for you?',
    timestamp: '2025-01-15T16:45:00Z',
    read: false
  }
];

export const mockFees: Fee[] = [
  {
    id: '1',
    studentId: '1',
    amount: 1200,
    dueDate: '2025-01-31',
    status: 'pending',
    description: 'Monthly Tuition Fee - January 2025'
  },
  {
    id: '2',
    studentId: '1',
    amount: 500,
    dueDate: '2025-01-15',
    status: 'paid',
    description: 'Annual Sports Fee'
  },
  {
    id: '3',
    studentId: '1',
    amount: 300,
    dueDate: '2025-02-15',
    status: 'upcoming',
    description: 'Laboratory Fee - Semester 2'
  }
];