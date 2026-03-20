// ===================================================
// App Entry Point — AgroControl
// ===================================================
import State from './state.js';
import { initRouter } from './router.js';

const initTheme = () => {
  const saved = localStorage.getItem('agro_theme');
  if (saved) {
    document.documentElement.dataset.theme = saved;
  }
};

const initApp = () => {
  initTheme();
  State.initAuth();
  initRouter();
};

// Arrancar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
