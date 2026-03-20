// ===================================================
// API Client — AgroControl
// ===================================================
const API_BASE = (() => {
  const saved = localStorage.getItem('agro_api_url');
  if (saved) return `${saved}/api`;
  const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  return isLocal
    ? 'http://localhost:3000/api'
    : 'https://agrocontrol-production.up.railway.app/api';
})();

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('agro_token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('agro_token');
      localStorage.removeItem('agro_user');
      window.location.hash = '#/login';
    }
    throw new ApiError(data.message || 'Error en la solicitud', response.status);
  }

  return data;
};

const api = {
  get: (endpoint, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`${endpoint}${qs ? '?' + qs : ''}`);
  },
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' })
};

export { api, ApiError };
