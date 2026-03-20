import { api } from './api.js';

export const calendarService = {
  getEvents: (month, year) => api.get('/calendar', { month, year }),
  create: (data) => api.post('/calendar', data),
  update: (id, data) => api.put(`/calendar/${id}`, data),
  delete: (id) => api.delete(`/calendar/${id}`)
};
