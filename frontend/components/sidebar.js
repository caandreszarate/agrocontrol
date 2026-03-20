// ===================================================
// Sidebar Component
// ===================================================
import State from '../js/state.js';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', section: 'principal' },
  { id: 'expenses', label: 'Gastos', icon: '💸', section: 'gestión' },
  { id: 'phases', label: 'Fases', icon: '🌱', section: 'gestión' },
  { id: 'payments', label: 'Pagos', icon: '📅', section: 'gestión' },
  { id: 'production', label: 'Producción', icon: '🍌', section: 'gestión' },
  { id: 'calendar', label: 'Calendario', icon: '🗓️', section: 'gestión' },
  { id: 'settings', label: 'Ajustes', icon: '⚙️', section: 'sistema' }
];

export const renderSidebar = () => {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const user = State.get('user');
  const currentRoute = State.get('currentRoute');

  // Agrupar por sección
  const sections = {};
  NAV_ITEMS.forEach(item => {
    if (!sections[item.section]) sections[item.section] = [];
    sections[item.section].push(item);
  });

  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <div class="sidebar-logo-icon">🌿</div>
      <div class="sidebar-logo-text">
        <strong>AgroControl</strong>
        <span>Plátano Hartón</span>
      </div>
    </div>
    <nav class="sidebar-nav">
      ${Object.entries(sections).map(([section, items]) => `
        <div class="nav-section-label">${section}</div>
        ${items.map(item => `
          <button class="nav-item ${currentRoute === item.id ? 'active' : ''}"
                  data-route="${item.id}">
            <span class="nav-item-icon">${item.icon}</span>
            <span class="nav-item-text">${item.label}</span>
          </button>
        `).join('')}
      `).join('')}
    </nav>
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">${user?.name?.[0]?.toUpperCase() || 'U'}</div>
        <div class="user-details">
          <strong>${user?.name || 'Usuario'}</strong>
          <span>${user?.role === 'admin' ? '🔑 Admin' : '👁 Viewer'}</span>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm" id="logout-btn" style="margin-top:0.5rem;width:100%">
        Cerrar sesión
      </button>
    </div>
  `;

  // Eventos
  sidebar.querySelectorAll('.nav-item[data-route]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.hash = `#/${btn.dataset.route}`;
      // Cerrar en móvil
      sidebar.classList.remove('open');
      document.querySelector('.sidebar-overlay')?.classList.remove('active');
    });
  });

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    State.clearAuth();
    window.location.hash = '#/login';
  });
};
