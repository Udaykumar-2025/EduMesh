import { useState, useEffect } from 'react';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('edumesh_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('edumesh_user');
      }
    }
    setIsLoading(false);
  }, []);

  const parseUserId = (userId: string): { role: string; schoolId: string; serialNo: string } => {
    // Format: schoolname-role-serialno
    const parts = userId.split('-');
    if (parts.length >= 3) {
      const schoolId = parts[0];
      const role = parts[1];
      const serialNo = parts.slice(2).join('-'); // Handle cases where serial might have dashes
      return { role, schoolId, serialNo };
    }
    
    // Fallback for invalid format
    return { role: 'student', schoolId: 'unknown', serialNo: '001' };
  };

  const authenticateUser = (schoolId: string, userId: string): User | null => {
    // Handle default admin case
    if (schoolId === 'default' && userId === 'default-admin') {
      return {
        id: 'default-admin',
        name: 'System Administrator',
        email: 'admin@edumesh.com',
        phone: '',
        role: 'admin',
        schoolId: 'default',
        isFirstTime: true
      };
    }

    // Parse user ID to determine role and details
    const { role, schoolId: parsedSchoolId, serialNo } = parseUserId(userId);
    
    // Verify school ID matches
    if (schoolId !== parsedSchoolId) {
      throw new Error('School ID and User ID do not match');
    }

    // Mock user data based on role and ID
    const mockUsers: Record<string, Partial<User>> = {
      'greenwood-admin-001': {
        name: 'Dr. Sarah Wilson',
        email: 'admin@greenwood.edu',
        role: 'admin'
      },
      'greenwood-teacher-001': {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@greenwood.edu',
        role: 'teacher'
      },
      'greenwood-parent-001': {
        name: 'John Thompson',
        email: 'john.thompson@parent.com',
        role: 'parent'
      },
      'greenwood-student-001': {
        name: 'Alex Thompson',
        email: 'alex.thompson@student.greenwood.edu',
        role: 'student'
      }
    };

    const userData = mockUsers[userId];
    if (!userData) {
      throw new Error('User not found');
    }

    return {
      id: userId,
      name: userData.name || 'Unknown User',
      email: userData.email || '',
      phone: '+1-555-0100',
      role: userData.role as any,
      schoolId: schoolId,
      avatar: `https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=150`
    };
  };

  const login = async (schoolId: string, userId: string) => {
    try {
      const userData = authenticateUser(schoolId, userId);
      if (userData) {
        setUser(userData);
        localStorage.setItem('edumesh_user', JSON.stringify(userData));
        localStorage.setItem('edumesh_session', JSON.stringify({
          schoolId,
          userId,
          loginTime: new Date().toISOString()
        }));
      }
    } catch (error) {
      throw error;
    }
  };

  const completeFirstTimeSetup = (schoolData: any) => {
    const adminUser: User = {
      id: schoolData.adminUserId,
      name: schoolData.principalName || 'School Administrator',
      email: schoolData.email || 'admin@school.edu',
      phone: schoolData.phone || '',
      role: 'admin',
      schoolId: schoolData.id,
      isFirstTime: false
    };
    
    setUser(adminUser);
    localStorage.setItem('edumesh_user', JSON.stringify(adminUser));
    localStorage.setItem('edumesh_school', JSON.stringify(schoolData));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('edumesh_user');
    localStorage.removeItem('edumesh_session');
    localStorage.removeItem('edumesh_school');
  };

  return { 
    user, 
    isLoading, 
    login, 
    logout, 
    completeFirstTimeSetup 
  };
}