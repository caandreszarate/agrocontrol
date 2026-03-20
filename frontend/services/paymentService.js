import { api } from './api.js';

export const paymentService = {
  getAll: (params = {}) => api.get('/payments', params),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  markAsPaid: (id, paidAmount) => api.patch(`/payments/${id}/pay`, { paidAmount }),
  delete: (id) => api.delete(`/payments/${id}`)
};
