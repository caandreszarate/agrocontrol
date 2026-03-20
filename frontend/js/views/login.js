// ===================================================
// Vista Login — Hero + Form
// ===================================================
import State from '../state.js';
import { authService } from '../../services/authService.js';
import { toast } from '../../components/toast.js';

export const renderLogin = () => {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="login-hero-page">

      <!-- LADO IZQUIERDO — Hero imagen -->
      <div class="login-hero-panel">
        <div class="login-hero-overlay"></div>
        <img src="assests/img/hero_agricultura.jpg" alt="Cultivo plátano hartón Granada Meta" class="login-hero-img">
        <div class="login-hero-content">
          <div class="login-hero-badge">🌿 Granada, Meta — Colombia</div>
          <h1 class="login-hero-title">
            Del campo<br>
            a tus <span class="login-hero-highlight">datos</span>
          </h1>
          <p class="login-hero-desc">
            Controla cada peso gastado, cada fase del cultivo y cada racimo cosechado de tu plátano hartón — en un solo lugar, desde cualquier dispositivo.
          </p>
          <div class="login-hero-stats">
            <div class="login-hero-stat">
              <span class="login-hero-stat-value">7</span>
              <span class="login-hero-stat-label">Fases de cultivo</span>
            </div>
            <div class="login-hero-stat-divider"></div>
            <div class="login-hero-stat">
              <span class="login-hero-stat-value">360°</span>
              <span class="login-hero-stat-label">Control financiero</span>
            </div>
            <div class="login-hero-stat-divider"></div>
            <div class="login-hero-stat">
              <span class="login-hero-stat-value">24/7</span>
              <span class="login-hero-stat-label">Acceso en línea</span>
            </div>
          </div>
        </div>
      </div>

      <!-- LADO DERECHO — Formulario -->
      <div class="login-form-panel">
        <div class="login-form-inner">

          <!-- Logo -->
          <div class="login-brand">
            <div class="login-brand-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12a10 10 0 0 1 10-10z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div>
              <div class="login-brand-name">AgroControl</div>
              <div class="login-brand-sub">Sistema de gestión agrícola</div>
            </div>
          </div>

          <!-- Encabezado form -->
          <div class="login-form-header">
            <h2 class="login-form-title">Bienvenido de nuevo</h2>
            <p class="login-form-subtitle">Ingresa tus credenciales para acceder al panel de control de tu cultivo.</p>
          </div>

          <!-- Form -->
          <form id="login-form" class="login-form" novalidate>
            <div class="login-field">
              <label for="email">Correo electrónico</label>
              <div class="login-input-wrap">
                <span class="login-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input type="email" id="email" placeholder="tu@correo.com" required autocomplete="email">
              </div>
            </div>

            <div class="login-field">
              <label for="password">Contraseña</label>
              <div class="login-input-wrap">
                <span class="login-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input type="password" id="password" placeholder="••••••••" required autocomplete="current-password">
                <button type="button" class="login-eye-btn" id="toggle-password" tabindex="-1">
                  <svg id="eye-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </div>

            <div id="login-error" class="login-error hidden">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span id="login-error-text"></span>
            </div>

            <button type="submit" class="login-submit-btn" id="login-btn">
              <span id="login-btn-text">Ingresar al sistema</span>
              <span id="login-btn-spinner" class="login-btn-spinner hidden"></span>
              <svg id="login-btn-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
              </svg>
            </button>
          </form>

          <!-- Footer -->
          <div class="login-form-footer">
            <div class="login-footer-divider">
              <span></span><p>Acceso seguro con cifrado JWT</p><span></span>
            </div>
            <p class="login-footer-copy">© 2024 AgroControl · Granada, Meta 🇨🇴</p>
          </div>

        </div>
      </div>

    </div>
  `;

  // Toggle ver/ocultar contraseña
  document.getElementById('toggle-password')?.addEventListener('click', () => {
    const input = document.getElementById('password');
    const icon = document.getElementById('eye-icon');
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    icon.innerHTML = isHidden
      ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
      : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
  });

  // Submit
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    const btnText = document.getElementById('login-btn-text');
    const btnSpinner = document.getElementById('login-btn-spinner');
    const btnArrow = document.getElementById('login-btn-arrow');
    const errorEl = document.getElementById('login-error');
    const errorText = document.getElementById('login-error-text');
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    btn.disabled = true;
    btnText.textContent = 'Verificando...';
    btnSpinner.classList.remove('hidden');
    btnArrow.classList.add('hidden');
    errorEl.classList.add('hidden');

    try {
      const res = await authService.login(email, password);
      State.saveAuth(res.token, res.user);
      btnText.textContent = '¡Acceso concedido!';
      btn.style.background = 'linear-gradient(135deg, #16a34a, #15803d)';
      toast.success(`Bienvenido, ${res.user.name} 🌿`);
      setTimeout(() => { window.location.hash = '#/dashboard'; }, 600);
    } catch (err) {
      errorText.textContent = err.message || 'Credenciales incorrectas';
      errorEl.classList.remove('hidden');
      btn.disabled = false;
      btnText.textContent = 'Ingresar al sistema';
      btnSpinner.classList.add('hidden');
      btnArrow.classList.remove('hidden');
      // Shake animation
      document.getElementById('login-form').classList.add('login-shake');
      setTimeout(() => document.getElementById('login-form')?.classList.remove('login-shake'), 500);
    }
  });
};
