const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL.replace('https://localhost', 'http://localhost');
    this.token = localStorage.getItem('edumesh_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication
  async sendOTP(contact: string, method: 'phone' | 'email') {
    return this.request('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ contact, method }),
    });
  }

  async verifyOTP(contact: string, otp: string, method: 'phone' | 'email') {
    return this.request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ contact, otp, method }),
    });
  }

  async register(userData: {
    name: string;
    email: string;
    phone: string;
    role: string;
    schoolCode?: string;
    schoolName?: string;
  }) {
    const response = await this.request<any>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.data?.accessToken) {
      this.setToken(response.data.accessToken);
    }
    
    return response;
  }

  async login(contact: string, method: 'phone' | 'email') {
    const response = await this.request<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ contact, method }),
    });
    
    if (response.data?.accessToken) {
      this.setToken(response.data.accessToken);
    }
    
    return response;
  }

  async getProfile() {
    return this.request('/api/auth/profile');
  }

  // Homework
  async getHomework(params?: {
    class_name?: string;
    subject_id?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/api/homework${queryString}`);
  }

  async createHomework(homeworkData: {
    subject_id: string;
    class_name: string;
    title: string;
    description: string;
    due_date: string;
    max_marks?: number;
    attachments?: string[];
  }) {
    return this.request('/api/homework', {
      method: 'POST',
      body: JSON.stringify(homeworkData),
    });
  }

  async submitHomework(homeworkId: string, submissionData: {
    notes?: string;
    attachments?: string[];
  }) {
    return this.request(`/api/homework/${homeworkId}/submit`, {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  }

  // Attendance
  async getAttendance(params?: {
    class_id?: string;
    date?: string;
    student_id?: string;
  }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/api/attendance${queryString}`);
  }

  async markAttendance(attendanceData: {
    class_id: string;
    date: string;
    attendance: Array<{
      student_id: string;
      status: 'present' | 'absent' | 'late' | 'excused';
      notes?: string;
    }>;
  }) {
    return this.request('/api/attendance/mark', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  async getAttendanceSummary(params?: {
    student_id?: string;
    month?: string;
    year?: string;
  }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/api/attendance/summary${queryString}`);
  }

  // Exams
  async getExams(params?: {
    class_name?: string;
    subject_id?: string;
    status?: string;
  }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/api/exams${queryString}`);
  }

  async createExam(examData: {
    subject_id: string;
    class_name: string;
    title: string;
    exam_date: string;
    start_time: string;
    end_time: string;
    location: string;
    max_marks?: number;
    instructions?: string;
  }) {
    return this.request('/api/exams', {
      method: 'POST',
      body: JSON.stringify(examData),
    });
  }

  // Fees
  async getFees(params?: {
    student_id?: string;
    status?: string;
  }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/api/fees${queryString}`);
  }

  async payFee(feeId: string, paymentData: {
    payment_method: string;
    transaction_id: string;
  }) {
    return this.request(`/api/fees/${feeId}/pay`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getFeesSummary(params?: { student_id?: string }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/api/fees/summary${queryString}`);
  }

  // Chat
  async getConversations() {
    return this.request('/api/chat/conversations');
  }

  async getMessages(userId: string, params?: {
    limit?: number;
    offset?: number;
  }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/api/chat/messages/${userId}${queryString}`);
  }

  async sendMessage(messageData: {
    receiver_id: string;
    content: string;
    message_type?: 'text' | 'image' | 'file';
    attachments?: string[];
  }) {
    return this.request('/api/chat/send', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getChatUsers(params?: {
    role?: string;
    search?: string;
  }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/api/chat/users${queryString}`);
  }

  // Notifications
  async getNotifications(params?: {
    is_read?: boolean;
    type?: string;
    limit?: number;
  }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/api/notifications${queryString}`);
  }

  async markNotificationRead(notificationId: string) {
    return this.request(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/api/notifications/mark-all-read', {
      method: 'PUT',
    });
  }

  async getNotificationCount() {
    return this.request('/api/notifications/count');
  }

  // Schools
  async getSchoolInfo() {
    return this.request('/api/schools/info');
  }

  async updateSchoolInfo(schoolData: {
    name?: string;
    address?: string;
    phone?: string;
    website?: string;
    logo_url?: string;
  }) {
    return this.request('/api/schools/info', {
      method: 'PUT',
      body: JSON.stringify(schoolData),
    });
  }

  async getSchoolStats() {
    return this.request('/api/schools/stats');
  }

  async getSubjects() {
    return this.request('/api/schools/subjects');
  }

  async createSubject(subjectData: {
    name: string;
    code: string;
    description?: string;
    color?: string;
  }) {
    return this.request('/api/schools/subjects', {
      method: 'POST',
      body: JSON.stringify(subjectData),
    });
  }

  // Users
  async getUsers(params?: {
    role?: string;
    search?: string;
  }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/api/users${queryString}`);
  }

  async createUser(userData: {
    name: string;
    email: string;
    phone: string;
    role: string;
    schoolCode?: string;
  }) {
    return this.register(userData);
  }

  async updateProfile(profileData: {
    name?: string;
    phone?: string;
    avatar_url?: string;
  }) {
    return this.request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async toggleUserStatus(userId: string) {
    return this.request(`/api/users/${userId}/toggle-status`, {
      method: 'PUT',
    });
  }

  // Utility methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('edumesh_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('edumesh_token');
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('edumesh_refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<any>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (response.data?.accessToken) {
      this.setToken(response.data.accessToken);
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
      localStorage.removeItem('edumesh_refresh_token');
    }
  }
}

export const apiService = new ApiService();
export default apiService;