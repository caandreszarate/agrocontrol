// ===================================================
// Router SPA — Hash-based
// ===================================================
import State from './state.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';
import { renderLogin } from './views/login.js';
import { renderDashboard } from './views/dashboard.js';
import { renderExpenses } from './views/expenses.js';
import { renderPhases } from './views/phases.js';
import { renderPayments } from './views/payments.js';
import { renderProduction } from './views/production.js';
import { renderCalendar } from './views/calendar.js';
import { renderSettings } from './views/settings.js';

// roles: qué roles pueden acceder. Si no se define, solo admin.
const ROUTES = {
  '/login':      { render: renderLogin, public: true },
  '/dashboard':  { render: renderDashboard, roles: ['admin', 'viewer'] },
  '/expenses':   { render: renderExpenses,  roles: ['admin', 'viewer'] },
  '/phases':     { render: renderPhases,    roles: ['admin', 'viewer'] },
  '/payments':   { render: renderPayments,  roles: ['admin', 'viewer'] },
  '/production': { render: renderProduction,roles: ['admin', 'viewer'] },
  '/calendar':   { render: renderCalendar,  roles: ['admin', 'jefecultivo', 'viewer'] },
  '/settings':   { render: renderSettings,  roles: ['admin'] }
};

const getRoute = () => {
  const hash = window.location.hash.replace('#', '') || '/dashboard';
  return hash.startsWith('/') ? hash : `/${hash}`;
};

const renderApp = (route, view) => {
  const app = document.getElementById('app');

  if (route === '/login') {
    app.innerHTML = '';
    view.render(app);
    return;
  }

  // Layout principal
  if (!document.getElementById('sidebar')) {
    app.innerHTML = `
      <div class="sidebar-overlay"></div>
      <aside class="sidebar" id="sidebar"></aside>
      <div class="main-wrapper">
        <header class="header" id="main-header"></header>
        <main class="page-content animate-fade" id="main-content"></main>
      </div>
    `;

    // Overlay click para cerrar sidebar en móvil
    document.querySelector('.sidebar-overlay')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.remove('open');
      document.querySelector('.sidebar-overlay')?.classList.remove('active');
    });
  }

  const routeId = route.replace('/', '') || 'dashboard';
  State.set('currentRoute', routeId);

  renderSidebar();
  renderHeader();

  const content = document.getElementById('main-content');
  if (content) {
    content.className = 'page-content page-enter';
    if (typeof view.render === 'function') {
      view.render(content);
    }
  }
};

export const navigate = (path) => {
  window.location.hash = `#${path}`;
};

export const initRouter = () => {
  const handleRoute = () => {
    const route = getRoute();
    const view = ROUTES[route] || ROUTES['/dashboard'];

    // Auth guard
    if (!view.public && !State.isAuthenticated()) {
      window.location.hash = '#/login';
      return;
    }

    if (view.public && State.isAuthenticated()) {
      const role = State.getRole();
      window.location.hash = role === 'jefecultivo' ? '#/calendar' : '#/dashboard';
      return;
    }

    // Role guard
    if (!view.public && view.roles) {
      const role = State.getRole();
      if (!view.roles.includes(role)) {
        window.location.hash = role === 'jefecultivo' ? '#/calendar' : '#/dashboard';
        return;
      }
    }

    renderApp(route, view);
  };

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
};
