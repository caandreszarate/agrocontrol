// ===================================================
// Header Component
// ===================================================
import State from '../js/state.js';

const ROUTE_TITLES = {
  dashboard: { title: 'Dashboard', subtitle: 'Resumen general del cultivo' },
  expenses: { title: 'Gastos', subtitle: 'Control de egresos por categoría' },
  phases: { title: 'Fases del Cultivo', subtitle: 'Progreso por etapa' },
  payments: { title: 'Pagos Programados', subtitle: 'Agenda de compromisos financieros' },
  production: { title: 'Producción', subtitle: 'Registros de cosecha y rentabilidad' },
  calendar: { title: 'Calendario Agrícola', subtitle: 'Actividades y eventos del cultivo' },
  settings: { title: 'Ajustes', subtitle: 'Configuración del sistema' }
};

export const renderHeader = (alerts = []) => {
  const header = document.getElementById('main-header');
  if (!header) return;

  const route = State.get('currentRoute');
  const info = ROUTE_TITLES[route] || { title: route, subtitle: '' };
  const theme = document.documentElement.dataset.theme || 'auto';
  const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  header.innerHTML = `
    <div class="header-left">
      <button class="menu-toggle" id="menu-toggle-btn" aria-label="Menú">☰</button>
      <div>
        <div class="header-title">${info.title}</div>
      </div>
    </div>
    <div class="header-right">
      ${alerts.length > 0 ? `
        <div class="header-badge" id="alerts-badge">
          🔔 ${alerts.length} alerta${alerts.length > 1 ? 's' : ''}
        </div>
      ` : ''}
      <button class="btn btn-ghost btn-icon" id="theme-toggle" title="Cambiar tema">
        ${isDark ? '☀️' : '🌙'}
      </button>
    </div>
  `;

  // Toggle tema
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme || 'auto';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('agro_theme', next);
    renderHeader(alerts);
  });

  // Toggle móvil
  document.getElementById('menu-toggle-btn')?.addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar?.classList.toggle('open');
    overlay?.classList.toggle('active');
  });

  // Alerts badge
  document.getElementById('alerts-badge')?.addEventListener('click', () => {
    window.location.hash = '#/payments';
  });
};
