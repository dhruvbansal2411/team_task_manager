import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const register = (name, email, password) => {
  return api.post('/auth/register', { name, email, password });
};

export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

// Project APIs
export const createProject = (name, description) => {
  return api.post('/projects', { name, description });
};

export const getProjects = () => {
  return api.get('/projects');
};

export const getProject = (id) => {
  return api.get(`/projects/${id}`);
};

export const addMember = (projectId, email) => {
  return api.post(`/projects/${projectId}/members`, { email });
};

// Task APIs
export const createTask = (projectId, title, description, assignedTo, dueDate) => {
  return api.post('/tasks', { projectId, title, description, assignedTo, dueDate });
};

export const getTasks = (projectId) => {
  return api.get(`/tasks/project/${projectId}`);
};

export const updateTaskStatus = (taskId, status) => {
  return api.patch(`/tasks/${taskId}/status`, { status });
};

// Dashboard APIs
export const getDashboardStats = () => {
  return api.get('/dashboard/stats');
};

export default api;
