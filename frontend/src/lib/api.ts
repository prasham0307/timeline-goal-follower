import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  deadline: string;
  template?: string;
  defaultTasks: Array<{
    title: string;
    isRecurring?: boolean;
    recurrence?: string;
  }>;
  progress?: {
    percentage: number;
    completed: number;
    total: number;
  };
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  date?: string;
  completed: boolean;
  isRecurring: boolean;
  recurrence?: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  category?: string;
  defaultTasks: Array<{
    title: string;
    isRecurring?: boolean;
    recurrence?: string;
  }>;
}

// Auth API
export const authApi = {
  signup: async (data: { email: string; password: string; name?: string }) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  passwordReset: async (email: string) => {
    const response = await api.post('/auth/password-reset', { email });
    return response.data;
  },
};

// Goals API
export const goalsApi = {
  getAll: async () => {
    const response = await api.get('/goals');
    return response.data;
  },

  getTodayTasks: async () => {
    const response = await api.get('/goals/today');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/goals/${id}`);
    return response.data;
  },

  create: async (data: {
    title: string;
    description?: string;
    startDate: string;
    deadline: string;
    template?: string;
    defaultTasks?: Array<{
      title: string;
      isRecurring?: boolean;
      recurrence?: string;
    }>;
  }) => {
    const response = await api.post('/goals', data);
    return response.data;
  },

  update: async (id: string, data: {
    title?: string;
    description?: string;
    startDate?: string;
    deadline?: string;
    template?: string;
  }) => {
    const response = await api.patch(`/goals/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  },

  getDayTasks: async (goalId: string, date: string) => {
    const response = await api.get(`/goals/${goalId}/days/${date}`);
    return response.data;
  },

  generateTimeline: async (goalId: string) => {
    const response = await api.post(`/goals/${goalId}/generate-timeline`);
    return response.data;
  },

  createTask: async (
    goalId: string,
    data: {
      title: string;
      notes?: string;
      date?: string;
      isRecurring?: boolean;
      recurrence?: string;
      completed?: boolean;
    }
  ) => {
    const response = await api.post(`/goals/${goalId}/tasks`, data);
    return response.data;
  },
};

// Tasks API
export const tasksApi = {
  update: async (
    id: string,
    data: {
      title?: string;
      notes?: string;
      completed?: boolean;
      date?: string;
      isRecurring?: boolean;
      recurrence?: string;
    }
  ) => {
    const response = await api.patch(`/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

// Templates API
export const templatesApi = {
  getAll: async () => {
    const response = await api.get('/templates');
    return response.data;
  },

  getByName: async (name: string) => {
    const response = await api.get(`/templates/${name}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    description?: string;
    category?: string;
    defaultTasks: Array<{
      title: string;
      notes?: string;
      isRecurring: boolean;
      recurrence?: string;
    }>;
  }) => {
    const response = await api.post('/templates', data);
    return response.data;
  },

  update: async (
    name: string,
    data: {
      description?: string;
      category?: string;
      defaultTasks?: Array<{
        title: string;
        notes?: string;
        isRecurring: boolean;
        recurrence?: string;
      }>;
    }
  ) => {
    const response = await api.put(`/templates/${name}`, data);
    return response.data;
  },

  delete: async (name: string) => {
    const response = await api.delete(`/templates/${name}`);
    return response.data;
  },
};
