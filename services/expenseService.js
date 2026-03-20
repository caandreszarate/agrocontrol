import { api } from './api.js';

export const expenseService = {
  getAll: (params = {}) => api.get('/expenses', params),
  getSummary: () => api.get('/expenses/summary'),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`)
};
