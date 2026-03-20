// ===================================================
// Vista Fases
// ===================================================
import { phaseService } from '../../services/phaseService.js';
import { formatDate, formatDateInput, loadingHTML, errorStateHTML } from '../ui.js';
import { modal } from '../../components/modal.js';
import { toast } from '../../components/toast.js';
import State from '../state.js';

export const renderPhases = async (container) => {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Fases del Cultivo</h1>
        <p class="page-subtitle">Progreso por etapa — plátano hartón</p>
      </div>
    </div>
    <div id="phases-grid">${loadingHTML()}</div>
  `;

  await loadPhases(container);
};

const loadPhases = async (container) => {
  const grid = document.getElementById('phases-grid');
  if (!grid) return;

  try {
    const res = await phaseService.getAll();
    const phases = res.data;

    const completed = phases.filter(p => p.status === 'completed').length;
    const overall = Math.round(phases.reduce((s, p) => s + p.progressPercent, 0) / phases.length);

    grid.innerHTML = `
      <!-- Progreso general -->
      <div class="card" style="margin-bottom:1.5rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem">
          <div>
            <h3 style="font-size:1rem;font-weight:700">Progreso General del Proyecto</h3>
            <p class="text-secondary text-sm">${completed} de ${phases.length} fases completadas</p>
          </div>
          <span style="font-size:1.5rem;font-weight:700;color:var(--color-primary)">${overall}%</span>
        </div>
        <div class="progress-bar-wrap" style="height:12px">
          <div class="progress-bar" style="width:${overall}%"></div>
        </div>
      </div>

      <!-- Grid de fases -->
      <div class="grid-3">
        ${phases.map(phase => phaseCardHTML(phase)).join('')}
      </div>
    `;

    // Eventos editar
    if (State.isAdmin()) {
      grid.querySelectorAll('[data-edit-phase]').forEach(btn => {
        const phase = phases.find(p => p._id === btn.dataset.editPhase);
        btn.addEventListener('click', () => openPhaseModal(phase, phases));
      });

      grid.querySelectorAll('[data-view-phase]').forEach(btn => {
        btn.addEventListener('click', () => viewPhaseDetail(btn.dataset.viewPhase));
      });
    }

  } catch (err) {
    grid.innerHTML = errorStateHTML(err.message);
  }
};

const phaseCardHTML = (phase) => {
  const statusMap = {
    pending: { label: 'Pendiente', cls: 'badge-neutral', icon: '⏳' },
    in_progress: { label: 'En progreso', cls: 'badge-warning', icon: '🔄' },
    completed: { label: 'Completado', cls: 'badge-success', icon: '✅' }
  };
  const s = statusMap[phase.status];

  return `
    <div class="phase-card ${phase.status} hover-lift">
      <div class="phase-header">
        <div class="phase-number">${phase.order}</div>
        <div class="phase-name">${phase.name}</div>
        <span class="badge ${s.cls}">${s.icon} ${s.label}</span>
      </div>
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <span class="text-secondary text-sm">Progreso</span>
          <span class="phase-percent">${phase.progressPercent}%</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar" style="width:${phase.progressPercent}%"></div>
        </div>
      </div>
      <div class="phase-dates">
        ${phase.startDate ? `<span>Inicio: ${formatDate(phase.startDate)}</span>` : '<span>Sin iniciar</span>'}
        ${phase.endDate ? `<span>Fin: ${formatDate(phase.endDate)}</span>` : ''}
      </div>
      ${phase.notes ? `<p class="text-secondary text-sm" style="border-top:1px solid var(--color-border);padding-top:0.75rem;margin-top:0">${phase.notes}</p>` : ''}
      ${phase.imageUrls?.length > 0 ? `
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          ${phase.imageUrls.map(url => `
            <img src="${url}" alt="Foto fase" style="width:60px;height:60px;object-fit:cover;border-radius:6px;cursor:pointer"
                 onclick="window.open('${url}','_blank')" onerror="this.style.display='none'">
          `).join('')}
        </div>
      ` : ''}
      ${State.isAdmin() ? `
        <div class="flex gap-2" style="margin-top:0.5rem">
          <button class="btn btn-secondary btn-sm" data-edit-phase="${phase._id}" style="flex:1">✏️ Editar</button>
          <button class="btn btn-ghost btn-sm" data-view-phase="${phase._id}" style="flex:1">📊 Gastos</button>
        </div>
      ` : ''}
    </div>
  `;
};

const openPhaseModal = (phase) => {
  modal.open({
    title: `Actualizar: ${phase.name}`,
    body: `
      <form id="phase-form">
        <div class="form-row">
          <div class="form-group">
            <label>Progreso (%)</label>
            <input type="number" name="progressPercent" min="0" max="100" value="${phase.progressPercent}" required>
            <div class="form-hint">0 = Pendiente, 100 = Completado</div>
          </div>
          <div class="form-group">
            <label>Estado</label>
            <select name="status">
              <option value="pending" ${phase.status === 'pending' ? 'selected' : ''}>Pendiente</option>
              <option value="in_progress" ${phase.status === 'in_progress' ? 'selected' : ''}>En progreso</option>
              <option value="completed" ${phase.status === 'completed' ? 'selected' : ''}>Completado</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Fecha inicio</label>
            <input type="date" name="startDate" value="${formatDateInput(phase.startDate)}">
          </div>
          <div class="form-group">
            <label>Fecha fin</label>
            <input type="date" name="endDate" value="${formatDateInput(phase.endDate)}">
          </div>
        </div>
        <div class="form-group">
          <label>Notas</label>
          <textarea name="notes" rows="3" placeholder="Observaciones de la fase...">${phase.notes || ''}</textarea>
        </div>
        <div class="form-group">
          <label>URLs de fotos (una por línea)</label>
          <textarea name="imageUrls" rows="3" placeholder="https://...">${(phase.imageUrls || []).join('\n')}</textarea>
          <div class="form-hint">Pega URLs de imágenes de Google Drive, Imgur, etc.</div>
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="modal-submit-btn" data-original-text="Actualizar">Actualizar</button>
    `
  });

  document.getElementById('modal-cancel')?.addEventListener('click', () => modal.close());
  document.getElementById('modal-submit-btn')?.addEventListener('click', async () => {
    const form = document.getElementById('phase-form');
    const fd = new FormData(form);
    const data = Object.fromEntries(fd);

    // Procesar imageUrls
    data.imageUrls = data.imageUrls
      ? data.imageUrls.split('\n').map(u => u.trim()).filter(u => u.startsWith('http'))
      : [];

    data.progressPercent = parseInt(data.progressPercent);
    if (!data.startDate) delete data.startDate;
    if (!data.endDate) delete data.endDate;

    modal.setLoading(true);
    try {
      await phaseService.update(phase._id, data);
      toast.success(`Fase "${phase.name}" actualizada`);
      modal.close();
      const container = document.getElementById('main-content');
      await loadPhases(container);
    } catch (err) {
      toast.error(err.message);
    } finally {
      modal.setLoading(false);
    }
  });
};

const viewPhaseDetail = async (phaseId) => {
  modal.open({
    title: 'Gastos de la Fase',
    size: 'lg',
    body: loadingHTML()
  });

  try {
    const res = await phaseService.getDetail(phaseId);
    const { phase, expenses, total } = res.data;

    document.getElementById('modal-body').innerHTML = `
      <div style="margin-bottom:1rem">
        <h4>${phase.name}</h4>
        <p class="text-secondary text-sm">Total gastado en esta fase: <strong style="color:var(--color-text)">${formatCurrency(total)}</strong></p>
      </div>
      ${expenses.length === 0
        ? '<p class="text-secondary" style="text-align:center;padding:2rem">Sin gastos registrados en esta fase</p>'
        : `<div class="table-wrapper">
            <table>
              <thead><tr><th>Fecha</th><th>Descripción</th><th>Categoría</th><th style="text-align:right">Monto</th></tr></thead>
              <tbody>
                ${expenses.map(e => `
                  <tr>
                    <td>${formatDate(e.date)}</td>
                    <td>${e.description}</td>
                    <td><span class="cat-badge ${e.category}">${e.category}</span></td>
                    <td style="text-align:right;font-weight:600">${formatCurrency(e.amount)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>`
      }
    `;
  } catch (err) {
    document.getElementById('modal-body').innerHTML = errorStateHTML(err.message);
  }
};

const formatCurrency = (amount) => new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', minimumFractionDigits: 0
}).format(amount);
