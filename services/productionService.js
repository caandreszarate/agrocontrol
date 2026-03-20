import { api } from './api.js';

export const productionService = {
  getAll: (params = {}) => api.get('/production', params),
  getSummary: () => api.get('/production/summary'),
  create: (data) => api.post('/production', data),
  update: (id, data) => api.put(`/production/${id}`, data),
  delete: (id) => api.delete(`/production/${id}`)
};
