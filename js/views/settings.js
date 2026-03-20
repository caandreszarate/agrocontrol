// ===================================================
// Vista Ajustes
// ===================================================
import State from '../state.js';
import { toast } from '../../components/toast.js';

export const renderSettings = (container) => {
  const user = State.get('user');
  const theme = document.documentElement.dataset.theme || 'auto';

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Ajustes</h1>
        <p class="page-subtitle">Configuración del sistema</p>
      </div>
    </div>

    <div class="grid-2" style="gap:1.5rem">
      <!-- Perfil -->
      <div class="card">
        <div class="card-header"><h3 class="card-title">Mi Perfil</h3></div>
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem">
          <div class="user-avatar" style="width:56px;height:56px;font-size:1.25rem">
            ${user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style="font-weight:700;font-size:1.1rem">${user?.name}</div>
            <div class="text-secondary text-sm">${user?.email}</div>
            <span class="badge ${user?.role === 'admin' ? 'badge-success' : 'badge-info'}" style="margin-top:4px">
              ${user?.role === 'admin' ? '🔑 Administrador' : '👁 Viewer'}
            </span>
          </div>
        </div>
      </div>

      <!-- Apariencia -->
      <div class="card">
        <div class="card-header"><h3 class="card-title">Apariencia</h3></div>
        <div class="form-group">
          <label>Tema</label>
          <select id="theme-select">
            <option value="auto" ${theme === 'auto' ? 'selected' : ''}>Automático (sistema)</option>
            <option value="light" ${theme === 'light' ? 'selected' : ''}>Claro</option>
            <option value="dark" ${theme === 'dark' ? 'selected' : ''}>Oscuro</option>
          </select>
        </div>
      </div>

      <!-- Info del proyecto -->
      <div class="card">
        <div class="card-header"><h3 class="card-title">Proyecto Agrícola</h3></div>
        <div class="stat-item">
          <span class="stat-label">Cultivo</span>
          <span class="stat-value">Plátano Hartón</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Ubicación</span>
          <span class="stat-value">Granada, Meta 🇨🇴</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Fases del cultivo</span>
          <span class="stat-value">7 etapas</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Categorías de gasto</span>
          <span class="stat-value">Trabajadores, Maquinaria, Insumos, Otros</span>
        </div>
      </div>

      <!-- API / Backend -->
      <div class="card">
        <div class="card-header"><h3 class="card-title">Conexión API</h3></div>
        <div class="form-group">
          <label>URL del Backend</label>
          <input type="url" id="api-url" value="${localStorage.getItem('agro_api_url') || 'http://localhost:3000'}"
                 placeholder="https://tu-backend.railway.app">
          <div class="form-hint">URL donde está desplegado el servidor Node.js</div>
        </div>
        <button class="btn btn-secondary" id="test-api-btn">🔗 Probar conexión</button>
        <div id="api-status" style="margin-top:0.75rem;font-size:0.875rem"></div>
      </div>
    </div>

    ${user?.role === 'admin' ? `
      <div class="card" style="margin-top:1.5rem">
        <div class="card-header"><h3 class="card-title">⚠️ Zona de Peligro</h3></div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem;background:var(--color-danger-bg);border-radius:8px">
          <div>
            <div style="font-weight:600">Cerrar sesión</div>
            <div class="text-secondary text-sm">Salir de la aplicación</div>
          </div>
          <button class="btn btn-danger" id="settings-logout">Cerrar sesión</button>
        </div>
      </div>
    ` : ''}
  `;

  // Tema
  document.getElementById('theme-select')?.addEventListener('change', (e) => {
    document.documentElement.dataset.theme = e.target.value;
    localStorage.setItem('agro_theme', e.target.value);
    toast.success('Tema actualizado');
  });

  // API URL
  document.getElementById('test-api-btn')?.addEventListener('click', async () => {
    const url = document.getElementById('api-url')?.value;
    const status = document.getElementById('api-status');
    if (!url) return;

    localStorage.setItem('agro_api_url', url);
    status.innerHTML = '<span class="text-secondary">Probando...</span>';

    try {
      const res = await fetch(`${url}/api/health`);
      const data = await res.json();
      if (data.success) {
        status.innerHTML = '<span class="text-primary">✅ Conexión exitosa</span>';
        toast.success('API conectada correctamente');
      } else {
        status.innerHTML = '<span class="text-danger">❌ API respondió con error</span>';
      }
    } catch {
      status.innerHTML = '<span class="text-danger">❌ No se pudo conectar</span>';
      toast.error('Error de conexión con el backend');
    }
  });

  // Logout
  document.getElementById('settings-logout')?.addEventListener('click', () => {
    if (confirm('¿Cerrar sesión?')) {
      State.clearAuth();
      window.location.hash = '#/login';
    }
  });
};
