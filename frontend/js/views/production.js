// ===================================================
// Vista Producción
// ===================================================
import { productionService } from '../../services/productionService.js';
import { formatCurrency, formatDate, formatDateInput, loadingHTML, errorStateHTML, emptyStateHTML } from '../ui.js';
import { modal } from '../../components/modal.js';
import { toast } from '../../components/toast.js';
import State from '../state.js';

let _currentPage = 1;

export const renderProduction = async (container) => {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Producción</h1>
        <p class="page-subtitle">Registros de cosecha y rentabilidad</p>
      </div>
      ${State.isAdmin() ? '<button class="btn btn-primary" id="new-production-btn">+ Nueva Cosecha</button>' : ''}
    </div>
    <div id="production-summary" style="margin-bottom:1.5rem">${loadingHTML()}</div>
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Registros de Cosecha</h3>
      </div>
      <div id="production-table">${loadingHTML()}</div>
    </div>
  `;

  document.getElementById('new-production-btn')?.addEventListener('click', () => openProductionModal(null));

  await Promise.all([loadSummary(), loadRecords()]);
};

const loadSummary = async () => {
  const el = document.getElementById('production-summary');
  if (!el) return;

  try {
    const res = await productionService.getSummary();
    const d = res.data;

    el.innerHTML = `
      <div class="grid-kpi">
        <div class="kpi-card" style="--kpi-accent:#22c55e;--kpi-accent-bg:#f0fdf4">
          <div class="kpi-icon">💰</div>
          <div class="kpi-label">Ingresos Totales</div>
          <div class="kpi-value">${formatCurrency(d.totalRevenue || 0, true)}</div>
        </div>
        <div class="kpi-card" style="--kpi-accent:#ef4444;--kpi-accent-bg:#fef2f2">
          <div class="kpi-icon">💸</div>
          <div class="kpi-label">Gastos Totales</div>
          <div class="kpi-value">${formatCurrency(d.totalExpenses || 0, true)}</div>
        </div>
        <div class="kpi-card" style="--kpi-accent:${(d.profit || 0) >= 0 ? '#22c55e' : '#ef4444'};--kpi-accent-bg:${(d.profit || 0) >= 0 ? '#f0fdf4' : '#fef2f2'}">
          <div class="kpi-icon">${(d.profit || 0) >= 0 ? '📈' : '📉'}</div>
          <div class="kpi-label">Utilidad Neta</div>
          <div class="kpi-value">${formatCurrency(d.profit || 0, true)}</div>
        </div>
        <div class="kpi-card" style="--kpi-accent:#f59e0b;--kpi-accent-bg:#fffbeb">
          <div class="kpi-icon">🌾</div>
          <div class="kpi-label">Racimos Cosechados</div>
          <div class="kpi-value">${(d.totalBunches || 0).toLocaleString()}</div>
        </div>
        <div class="kpi-card" style="--kpi-accent:#3b82f6;--kpi-accent-bg:#eff6ff">
          <div class="kpi-icon">⚖️</div>
          <div class="kpi-label">Kg Producidos</div>
          <div class="kpi-value">${(d.totalWeightKg || 0).toLocaleString()} kg</div>
        </div>
        <div class="kpi-card" style="--kpi-accent:#8b5cf6;--kpi-accent-bg:#f5f3ff">
          <div class="kpi-icon">📊</div>
          <div class="kpi-label">ROI</div>
          <div class="kpi-value">${d.roi || 0}%</div>
        </div>
      </div>
    `;
  } catch (err) {
    el.innerHTML = `<p class="text-secondary text-sm">Error cargando resumen</p>`;
  }
};

const loadRecords = async () => {
  const table = document.getElementById('production-table');
  if (!table) return;
  table.innerHTML = loadingHTML();

  try {
    const res = await productionService.getAll({ page: _currentPage, limit: 15 });
    const { data, pagination } = res;

    if (data.length === 0) {
      table.innerHTML = emptyStateHTML('🍌', 'Sin registros de cosecha',
        'Registra la primera cosecha de plátano hartón',
        State.isAdmin() ? '<button class="btn btn-primary" id="empty-new-btn">+ Nueva Cosecha</button>' : ''
      );
      document.getElementById('empty-new-btn')?.addEventListener('click', () => openProductionModal(null));
      return;
    }

    table.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th style="text-align:right">Racimos</th>
              <th style="text-align:right">Peso (kg)</th>
              <th style="text-align:right">Precio/kg</th>
              <th style="text-align:right">Ingresos</th>
              <th>Notas</th>
              ${State.isAdmin() ? '<th style="text-align:center">Acciones</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${data.map(r => `
              <tr>
                <td>${formatDate(r.date)}</td>
                <td style="text-align:right">${r.bunchesHarvested.toLocaleString()}</td>
                <td style="text-align:right">${r.weightKg.toLocaleString()} kg</td>
                <td style="text-align:right">${formatCurrency(r.pricePerKg)}/kg</td>
                <td style="text-align:right;font-weight:700;color:var(--color-success)">${formatCurrency(r.totalRevenue)}</td>
                <td style="color:var(--color-text-secondary);font-size:0.875rem">${r.notes || '—'}</td>
                ${State.isAdmin() ? `
                  <td style="text-align:center">
                    <div class="flex gap-2" style="justify-content:center">
                      <button class="btn btn-ghost btn-sm" data-edit="${r._id}">✏️</button>
                      <button class="btn btn-ghost btn-sm" data-delete="${r._id}">🗑️</button>
                    </div>
                  </td>
                ` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ${renderPagination(pagination)}
    `;

    // Eventos
    table.querySelectorAll('[data-edit]').forEach(btn => {
      const record = data.find(r => r._id === btn.dataset.edit);
      btn.addEventListener('click', () => openProductionModal(record));
    });

    table.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => deleteRecord(btn.dataset.delete));
    });

    table.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _currentPage = parseInt(btn.dataset.page);
        loadRecords();
      });
    });

  } catch (err) {
    table.innerHTML = errorStateHTML(err.message);
  }
};

const openProductionModal = (record) => {
  const isEdit = !!record;
  modal.open({
    title: isEdit ? 'Editar Registro' : 'Nueva Cosecha',
    body: `
      <form id="production-form">
        <div class="form-row">
          <div class="form-group">
            <label>Fecha de cosecha</label>
            <input type="date" name="date" value="${formatDateInput(record?.date)}" required>
          </div>
          <div class="form-group">
            <label>Racimos cosechados</label>
            <input type="number" name="bunchesHarvested" value="${record?.bunchesHarvested || ''}" min="0" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Peso total (kg)</label>
            <input type="number" name="weightKg" id="prod-weight" value="${record?.weightKg || ''}" min="0" step="0.1" required>
          </div>
          <div class="form-group">
            <label>Precio por kg (COP)</label>
            <input type="number" name="pricePerKg" id="prod-price" value="${record?.pricePerKg || ''}" min="0" required>
          </div>
        </div>
        <div class="form-group" style="background:var(--color-success-bg);border:1px solid var(--color-success);border-radius:8px;padding:0.75rem">
          <label style="color:var(--color-success)">Total ingresos estimados</label>
          <div id="revenue-preview" style="font-size:1.25rem;font-weight:700;color:var(--color-success)">$0</div>
        </div>
        <div class="form-group">
          <label>Notas (opcional)</label>
          <textarea name="notes" rows="2">${record?.notes || ''}</textarea>
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="modal-submit-btn" data-original-text="${isEdit ? 'Actualizar' : 'Registrar'}">
        ${isEdit ? 'Actualizar' : 'Registrar'}
      </button>
    `
  });

  // Preview ingresos en tiempo real
  const updatePreview = () => {
    const w = parseFloat(document.getElementById('prod-weight')?.value) || 0;
    const p = parseFloat(document.getElementById('prod-price')?.value) || 0;
    const preview = document.getElementById('revenue-preview');
    if (preview) preview.textContent = formatCurrency(w * p);
  };

  document.getElementById('prod-weight')?.addEventListener('input', updatePreview);
  document.getElementById('prod-price')?.addEventListener('input', updatePreview);
  if (record) updatePreview();

  document.getElementById('modal-cancel')?.addEventListener('click', () => modal.close());
  document.getElementById('modal-submit-btn')?.addEventListener('click', async () => {
    const form = document.getElementById('production-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = Object.fromEntries(new FormData(form));

    modal.setLoading(true);
    try {
      if (isEdit) {
        await productionService.update(record._id, data);
        toast.success('Registro actualizado');
      } else {
        await productionService.create(data);
        toast.success('Cosecha registrada');
      }
      modal.close();
      await Promise.all([loadSummary(), loadRecords()]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      modal.setLoading(false);
    }
  });
};

const deleteRecord = async (id) => {
  if (!confirm('¿Eliminar este registro de cosecha?')) return;
  try {
    await productionService.delete(id);
    toast.success('Registro eliminado');
    await Promise.all([loadSummary(), loadRecords()]);
  } catch (err) {
    toast.error(err.message);
  }
};

const renderPagination = ({ total, page, pages }) => {
  if (pages <= 1) return '';
  return `
    <div class="pagination">
      <button class="page-btn" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''}>←</button>
      ${Array.from({ length: pages }, (_, i) =>
        `<button class="page-btn ${i + 1 === page ? 'active' : ''}" data-page="${i + 1}">${i + 1}</button>`
      ).join('')}
      <button class="page-btn" data-page="${page + 1}" ${page === pages ? 'disabled' : ''}>→</button>
    </div>
  `;
};
