import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Student {
  id?: string
  user_id?: string
  school_id: string
  student_id: string
  name: string
  email: string
  phone?: string
  class_name: string
  roll_number: string
  date_of_birth?: string
  parent_name?: string
  parent_email?: string
  parent_phone?: string
  created_at?: string
  updated_at?: string
}

export interface Teacher {
  id?: string
  user_id?: string
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

export interface School {
  id: string
  name: string
  code: string
  region: string
  admin_email: string
}

// Helper functions for database operations
export const dbOperations = {
  // Students
  async getStudents(schoolId: string) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        users!students_user_id_fkey(name, email, phone)
      `)
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async addStudent(student: Student) {
    // First create user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        name: student.name,
        email: student.email,
        phone: student.phone,
        role: 'student',
        school_id: student.school_id
      })
      .select()
      .single()

    if (userError) throw userError

    // Then create student record
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .insert({
        user_id: userData.id,
        school_id: student.school_id,
        student_id: student.student_id,
        class_name: student.class_name,
        roll_number: student.roll_number,
        date_of_birth: student.date_of_birth,
        parent_id: null // We'll handle parent creation separately
      })
      .select()
      .single()

    if (studentError) throw studentError

    // Create parent if provided
    if (student.parent_name && student.parent_email) {
      const { data: parentData, error: parentError } = await supabase
        .from('users')
        .insert({
          name: student.parent_name,
          email: student.parent_email,
          phone: student.parent_phone,
          role: 'parent',
          school_id: student.school_id
        })
        .select()
        .single()

      if (!parentError) {
        // Update student with parent_id
        await supabase
          .from('students')
          .update({ parent_id: parentData.id })
          .eq('id', studentData.id)
      }
    }

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
        users!teachers_user_id_fkey(name, email, phone)
      `)
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async addTeacher(teacher: Teacher) {
    // First create user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        role: 'teacher',
        school_id: teacher.school_id
      })
      .select()
      .single()

    if (userError) throw userError

    // Then create teacher record
    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .insert({
        user_id: userData.id,
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