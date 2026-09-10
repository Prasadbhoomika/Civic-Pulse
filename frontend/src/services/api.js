import axios from 'axios';

const API = axios.create({
  baseURL: '/api'
});

// Request interceptor to attach JWT bearer token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('civicpulse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getMe: () => API.get('/auth/me')
};

export const complaintAPI = {
  create: (data) => API.post('/complaints', data),
  getAll: (params) => API.get('/complaints', { params }),
  getById: (id) => API.get(`/complaints/${id}`),
  updateStatus: (id, data) => API.patch(`/complaints/${id}/status`, data),
  assignWorker: (id, data) => API.patch(`/complaints/${id}/assign`, data),
  support: (id) => API.post(`/complaints/${id}/support`),
  resolve: (id, data) => API.post(`/complaints/${id}/resolve`, data),
  verify: (id, data) => API.post(`/complaints/${id}/verify`, data),
  getNearby: (params) => API.get('/complaints/nearby', { params }),
  addComment: (id, data) => API.post(`/complaints/${id}/comments`, data),
  uploadMedia: (formData) => API.post('/complaints/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const departmentAPI = {
  getAll: () => API.get('/departments'),
  getWorkers: (params) => API.get('/departments/workers', { params })
};

export const notificationAPI = {
  getAll: () => API.get('/notifications'),
  markRead: (id) => API.patch(`/notifications/${id}/read`),
  markAllRead: () => API.patch('/notifications/read-all')
};

export const analyticsAPI = {
  getAdminStats: () => API.get('/analytics/admin'),
  getDepartmentStats: (params) => API.get('/analytics/department', { params })
};

export default API;
