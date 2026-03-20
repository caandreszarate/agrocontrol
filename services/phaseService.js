import { api } from './api.js';

export const phaseService = {
  getAll: () => api.get('/phases'),
  getDetail: (id) => api.get(`/phases/${id}/detail`),
  update: (id, data) => api.put(`/phases/${id}`, data)
};
