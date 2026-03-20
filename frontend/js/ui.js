// ===================================================
// UI Helpers — AgroControl
// ===================================================

export const $ = (selector, parent = document) => parent.querySelector(selector);
export const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

export const createElement = (tag, attrs = {}, children = []) => {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v);
  });
  children.forEach(child => {
    if (typeof child === 'string') el.appendChild(document.createTextNode(child));
    else if (child) el.appendChild(child);
  });
  return el;
};

export const formatCurrency = (amount, short = false) => {
  if (amount === null || amount === undefined) return '$0';
  if (short && amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (short && amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateStr, opts = {}) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date)) return '—';
  const defaults = { day: '2-digit', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('es-CO', { ...defaults, ...opts });
};

export const formatDateInput = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date)) return '';
  return date.toISOString().split('T')[0];
};

export const relativeDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((date - now) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Mañana';
  if (diff === -1) return 'Ayer';
  if (diff > 1) return `En ${diff} días`;
  return `Hace ${Math.abs(diff)} días`;
};

export const statusBadge = (status) => {
  const map = {
    pending: { label: 'Pendiente', cls: 'badge-neutral' },
    in_progress: { label: 'En progreso', cls: 'badge-warning' },
    completed: { label: 'Completado', cls: 'badge-success' }
  };
  const s = map[status] || { label: status, cls: 'badge-neutral' };
  return `<span class="badge ${s.cls}">${s.label}</span>`;
};

export const categoryBadge = (cat) => {
  const map = {
    trabajadores: 'Trabajadores',
    maquinaria: 'Maquinaria',
    insumos: 'Insumos',
    otros: 'Otros',
    arriendo: 'Arriendo'
  };
  return `<span class="cat-badge ${cat}">${map[cat] || cat}</span>`;
};

export const setHTML = (selector, html) => {
  const el = $(selector);
  if (el) el.innerHTML = html;
};

export const setText = (selector, text) => {
  const el = $(selector);
  if (el) el.textContent = text;
};

export const show = (selector) => {
  const el = typeof selector === 'string' ? $(selector) : selector;
  if (el) el.classList.remove('hidden');
};

export const hide = (selector) => {
  const el = typeof selector === 'string' ? $(selector) : selector;
  if (el) el.classList.add('hidden');
};

export const toggle = (selector, condition) => {
  const el = typeof selector === 'string' ? $(selector) : selector;
  if (!el) return;
  el.classList.toggle('hidden', !condition);
};

export const loadingHTML = (message = 'Cargando...') => `
  <div class="loading-container">
    <div class="spinner"></div>
    <span>${message}</span>
  </div>
`;

export const emptyStateHTML = (icon, title, desc, action = '') => `
  <div class="empty-state animate-fade">
    <div class="empty-state-icon">${icon}</div>
    <h3>${title}</h3>
    <p>${desc}</p>
    ${action}
  </div>
`;

export const errorStateHTML = (message = 'Error al cargar datos') => `
  <div class="empty-state animate-fade">
    <div class="empty-state-icon">⚠️</div>
    <h3>Error</h3>
    <p>${message}</p>
  </div>
`;
