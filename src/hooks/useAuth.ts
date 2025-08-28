import { useState, useEffect } from 'react';
import { dbOperations } from '../lib/supabase';

interface User {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'teacher' | 'parent' | 'student';
  schoolId: string;
  avatar?: string;
  isFirstTime?: boolean;
}

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

  const parseUserId = (userId: string): { role: string; schoolCode: string; serialNo: string } => {
    // Format: schoolcode-role-serialno
    const parts = userId.split('-');
    if (parts.length >= 3) {
      const schoolCode = parts[0];
      const role = parts[1];
      const serialNo = parts.slice(2).join('-'); // Handle cases where serial might have dashes
      return { role, schoolCode, serialNo };
    }
    
    // Fallback for invalid format
    return { role: 'student', schoolCode: 'unknown', serialNo: '001' };
  };

  const authenticateUser = async (schoolCode: string, userId: string): Promise<User | null> => {
    // Handle default admin case
    if (schoolCode === 'default' && userId === 'default-admin') {
      return {
        id: 'default-admin',
        user_id: 'default-admin',
        name: 'System Administrator',
        email: 'admin@edumesh.com',
        phone: '',
        role: 'admin',
        schoolId: 'default',
        isFirstTime: true
      };
    }

    try {
      // Use database authentication
      const userData = await dbOperations.authenticateUser(schoolCode, userId);
      
      return {
        id: userData.id,
        user_id: userData.user_id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        role: userData.role,
        schoolId: userData.school_id,
        avatar: userData.avatar_url
      };
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  };

  const login = async (schoolCode: string, userId: string) => {
    try {
      const userData = await authenticateUser(schoolCode, userId);
      if (userData) {
        setUser(userData);
        localStorage.setItem('edumesh_user', JSON.stringify(userData));
        localStorage.setItem('edumesh_session', JSON.stringify({
          schoolCode,
          userId,
          loginTime: new Date().toISOString()
        }));
      }
    } catch (error) {
      throw error;
    }
  };

  const completeFirstTimeSetup = async (schoolData: any) => {
    try {
      // Create school in database
      const school = await dbOperations.createSchool({
        name: schoolData.name,
        code: schoolData.shortName.toLowerCase().replace(/\s+/g, ''),
        region: schoolData.region || 'Default Region',
        admin_email: schoolData.email,
        address: schoolData.address,
        phone: schoolData.phone,
        website: schoolData.website
      });

      // Create admin user
      const adminUserId = `${school.code}-admin-001`;
      const adminUser = await dbOperations.createUser({
        user_id: adminUserId,
        name: schoolData.principalName || 'School Administrator',
        email: schoolData.email || 'admin@school.edu',
        phone: schoolData.phone || '',
        role: 'admin',
        school_id: school.id
      });

      const userData: User = {
        id: adminUser.id,
        user_id: adminUser.user_id,
        name: adminUser.name,
        email: adminUser.email,
        phone: adminUser.phone || '',
        role: adminUser.role,
        schoolId: adminUser.school_id,
        isFirstTime: false
      };
      
      setUser(userData);
      localStorage.setItem('edumesh_user', JSON.stringify(userData));
      localStorage.setItem('edumesh_school', JSON.stringify(school));
    } catch (error) {
      console.error('First time setup error:', error);
      throw error;
    }
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