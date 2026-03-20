import { api } from './api.js';

export const dashboardService = {
  getData: () => api.get('/dashboard')
};
