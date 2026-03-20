// ===================================================
// Toast Notifications
// ===================================================
const ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

let container;

const getContainer = () => {
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
};

export const toast = {
  show(message, type = 'info', duration = 3500) {
    const c = getContainer();
    const el = document.createElement('div');
    el.className = `toast toast-${type} animate-fade`;
    el.innerHTML = `<span>${ICONS[type]}</span><span>${message}</span>`;

    c.appendChild(el);

    setTimeout(() => {
      el.style.animation = 'toast-out 0.3s ease forwards';
      setTimeout(() => el.remove(), 300);
    }, duration);
  },
  success: (msg) => toast.show(msg, 'success'),
  error: (msg) => toast.show(msg, 'error'),
  warning: (msg) => toast.show(msg, 'warning'),
  info: (msg) => toast.show(msg, 'info')
};
