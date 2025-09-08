import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bewvloxalhzymrumstvu.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please add VITE_SUPABASE_ANON_KEY to your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types - Updated for new user_id format
export interface Student {
  id?: string
  user_id?: string  // Format: schoolcode-role-serialno (e.g., greenwood-student-001)
  school_id: string
  student_id: string
  name: string
  email: string
  phone?: string
  class_name: string
  roll_number: string
  date_of_birth?: string
  parent_user_id?: string  // References users.user_id instead of separate fields
  created_at?: string
  updated_at?: string
}

export interface Teacher {
  id?: string
  user_id?: string  // Format: schoolcode-role-serialno (e.g., greenwood-teacher-001)
  school_id: string
  employee_id: string
  name: string
  email: string
  phone?: string
  qualification?: string
  experience_years?: number
  subjects?: string[]
  created_at?: string
  updated_at?: string
}

export interface User {
  id: string
  user_id: string  // Format: schoolcode-role-serialno
  name: string
  email: string
  phone?: string
  role: 'admin' | 'teacher' | 'parent' | 'student'
  school_id: string
  avatar_url?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface School {
  id: string
  name: string
  code: string  // Used in user_id format (e.g., 'greenwood')
  region: string
  admin_email: string
}

// Helper functions for database operations - Updated for new schema
export const dbOperations = {
  // Authentication helpers
  async authenticateUser(schoolCode: string, userId: string) {
    // For default admin case
    if (schoolCode === 'default' && userId === 'default-admin') {
      return {
        id: 'default-admin',
        user_id: 'default-admin',
        name: 'System Administrator',
        email: 'admin@edumesh.com',
        phone: '',
        role: 'admin',
        school_id: 'default',
        is_active: true,
      }
    }

    const { data: users, error } = await supabase
      .from('users')
      .select(`
        *,
        schools(name, code, region)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1)
    
    if (error) throw error
    
    if (!users || users.length === 0) {
      throw new Error('User not found or inactive')
    }
    
    const user = users[0]
    
    // Verify school code matches
    const userSchoolCode = userId.split('-')[0]
    if (userSchoolCode !== schoolCode) {
      throw new Error('School ID and User ID do not match')
    }
    
    return user
  },

  async generateUserId(schoolCode: string, role: string) {
    // Get the next serial number for this school and role
    const { data: users, error } = await supabase
      .from('users')
      .select('user_id')
      .like('user_id', `${schoolCode}-${role}-%`)
      .order('user_id', { ascending: false })
      .limit(1)
    
    if (error) throw error
    
    let nextSerial = 1
    if (users && users.length > 0) {
      const lastUserId = users[0].user_id
      const lastSerial = parseInt(lastUserId.split('-')[2])
      nextSerial = lastSerial + 1
    }
    
    return `${schoolCode}-${role}-${nextSerial.toString().padStart(3, '0')}`
  },

  // Students
  async getStudents(schoolId: string) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        users(name, email, phone),
        parent:parent_user_id(name, email, phone)
      `)
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async addStudent(student: Student) {
    // Generate user_id if not provided
    let userId = student.user_id
    if (!userId) {
      const { data: school } = await supabase
        .from('schools')
        .select('code')
        .eq('id', student.school_id)
        .single()
      
      if (school) {
        userId = await this.generateUserId(school.code, 'student')
      }
    }

    // Create user record
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        user_id: userId,
        name: student.name,
        email: student.email,
        phone: student.phone,
        role: 'student',
        school_id: student.school_id
      })
      .select()
      .single()

    if (userError) throw userError

    // Create student record
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .insert({
        user_id: userId,
        school_id: student.school_id,
        student_id: student.student_id,
        class_name: student.class_name,
        roll_number: student.roll_number,
        date_of_birth: student.date_of_birth,
        parent_user_id: student.parent_user_id
      })
      .select()
      .single()

    if (studentError) throw studentError
    return studentData
  },

  async bulkAddStudents(students: Student[]) {
    const results = []
    const errors = []

    for (const student of students) {
      try {
        const result = await this.addStudent(student)
        results.push(result)
      } catch (error) {
        errors.push({ student, error: error.message })
      }
    }

    return { results, errors }
  },

  // Teachers
  async getTeachers(schoolId: string) {
    const { data, error } = await supabase
      .from('teachers')
      .select(`
        *,
        users(name, email, phone)
      `)
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async addTeacher(teacher: Teacher) {
    // Generate user_id if not provided
    let userId = teacher.user_id
    if (!userId) {
      const { data: school } = await supabase
        .from('schools')
        .select('code')
        .eq('id', teacher.school_id)
        .single()
      
      if (school) {
        userId = await this.generateUserId(school.code, 'teacher')
      }
    }

    // Create user record
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        user_id: userId,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        role: 'teacher',
        school_id: teacher.school_id
      })
      .select()
      .single()

    if (userError) throw userError

    // Create teacher record
    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .insert({
        user_id: userId,
        school_id: teacher.school_id,
        employee_id: teacher.employee_id,
        qualification: teacher.qualification,
        experience_years: teacher.experience_years || 0,
        subjects: teacher.subjects || []
      })
      .select()
      .single()

    if (teacherError) throw teacherError
    return teacherData
  },

  async bulkAddTeachers(teachers: Teacher[]) {
    const results = []
    const errors = []

    for (const teacher of teachers) {
      try {
        const result = await this.addTeacher(teacher)
        results.push(result)
      } catch (error) {
        errors.push({ teacher, error: error.message })
      }
    }

    return { results, errors }
  },

  // Users
  async createUser(userData: {
    user_id?: string
    name: string
    email: string
    phone?: string
    role: string
    school_id: string
  }) {
    // Generate user_id if not provided
    let userId = userData.user_id
    if (!userId) {
      const { data: school } = await supabase
        .from('schools')
        .select('code')
        .eq('id', userData.school_id)
        .single()
      
      if (school) {
        userId = await this.generateUserId(school.code, userData.role)
      }
    }

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        ...userData,
        user_id: userId,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error
    return user
  },

  // Schools
  async createSchool(schoolData: {
    name: string
    code: string
    region?: string
    admin_email: string
    address?: string
    phone?: string
    website?: string
  }) {
    const { data: school, error } = await supabase
      .from('schools')
      .insert({
        ...schoolData,
        region: schoolData.region || 'Default Region'
      })
      .select()
      .single()

    if (error) throw error
    return school
  },

  // Subjects
  async getSubjects(schoolId: string) {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('school_id', schoolId)
      .order('name')
    
    if (error) throw error
    return data
  }
}