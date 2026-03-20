// ===================================================
// Vista Gastos
// ===================================================
import { expenseService } from '../../services/expenseService.js';
import { phaseService } from '../../services/phaseService.js';
import { formatCurrency, formatDate, formatDateInput, loadingHTML, errorStateHTML, emptyStateHTML } from '../ui.js';
import { modal } from '../../components/modal.js';
import { toast } from '../../components/toast.js';
import State from '../state.js';

let _phases = [];
let _currentPage = 1;
let _filters = {};

export const renderExpenses = async (container) => {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Gastos</h1>
        <p class="page-subtitle">Control de egresos por categoría y fase</p>
      </div>
      ${State.isAdmin() ? '<button class="btn btn-primary" id="new-expense-btn">+ Nuevo Gasto</button>' : ''}
    </div>
    <div id="expense-summary" style="margin-bottom:1rem"></div>
    <div class="card">
      <div class="filters-bar">
        <select id="filter-category">
          <option value="">Todas las categorías</option>
          <option value="trabajadores">Trabajadores</option>
          <option value="maquinaria">Maquinaria</option>
          <option value="insumos">Insumos</option>
          <option value="alquiler">Alquiler Terreno</option>
          <option value="otros">Otros</option>
        </select>
        <select id="filter-phase">
          <option value="">Todas las fases</option>
        </select>
        <input type="date" id="filter-start" placeholder="Desde">
        <input type="date" id="filter-end" placeholder="Hasta">
        <button class="btn btn-secondary btn-sm" id="clear-filters-btn">Limpiar</button>
      </div>
      <div id="expenses-table">${loadingHTML()}</div>
    </div>
  `;

  // Cargar fases para filtro
  try {
    const res = await phaseService.getAll();
    _phases = res.data;
    const phaseSelect = document.getElementById('filter-phase');
    _phases.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p._id;
      opt.textContent = p.name;
      phaseSelect.appendChild(opt);
    });
  } catch {}

  document.getElementById('new-expense-btn')?.addEventListener('click', () => openExpenseModal(null, _phases));
  document.getElementById('clear-filters-btn')?.addEventListener('click', clearFilters);
  ['filter-category', 'filter-phase', 'filter-start', 'filter-end'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', applyFilters);
  });

  await loadSummary();
  await loadExpenses();
};

const loadSummary = async () => {
  try {
    const res = await expenseService.getSummary();
    const { total, byCategory } = res.data;
    document.getElementById('expense-summary').innerHTML = `
      <div class="grid-kpi" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr))">
        <div class="kpi-card" style="--kpi-accent:#ef4444;--kpi-accent-bg:#fef2f2">
          <div class="kpi-label">Total Gastado</div>
          <div class="kpi-value">${formatCurrency(total, true)}</div>
        </div>
        ${byCategory.map(c => `
          <div class="kpi-card">
            <div class="kpi-label">${catLabel(c._id)}</div>
            <div class="kpi-value">${formatCurrency(c.total, true)}</div>
          </div>
        `).join('')}
      </div>
    `;
  } catch {}
};

const loadExpenses = async () => {
  const tbody = document.getElementById('expenses-table');
  if (!tbody) return;
  tbody.innerHTML = loadingHTML();

  try {
    const params = { page: _currentPage, limit: 15, ..._filters };
    const res = await expenseService.getAll(params);
    const { data, pagination } = res;

    if (data.length === 0) {
      tbody.innerHTML = emptyStateHTML('💸', 'Sin gastos', 'Registra el primer gasto del cultivo',
        State.isAdmin() ? '<button class="btn btn-primary" onclick="document.getElementById(\'new-expense-btn\').click()">+ Nuevo Gasto</button>' : ''
      );
      return;
    }

    tbody.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Fase</th>
              <th style="text-align:right">Monto</th>
              ${State.isAdmin() ? '<th style="text-align:center">Acciones</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${data.map(e => `
              <tr>
                <td>${formatDate(e.date)}</td>
                <td title="${e.description}">${e.description.length > 50 ? e.description.slice(0, 50) + '...' : e.description}</td>
                <td><span class="cat-badge ${e.category}">${catLabel(e.category)}</span></td>
                <td>${e.phase?.name || '—'}</td>
                <td style="text-align:right;font-weight:600">${formatCurrency(e.amount)}</td>
                ${State.isAdmin() ? `
                  <td style="text-align:center">
                    <div class="flex gap-2" style="justify-content:center">
                      <button class="btn btn-ghost btn-sm" data-edit="${e._id}" title="Editar">✏️</button>
                      <button class="btn btn-ghost btn-sm" data-delete="${e._id}" title="Eliminar">🗑️</button>
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

    // Eventos editar/eliminar
    tbody.querySelectorAll('[data-edit]').forEach(btn => {
      const expense = data.find(e => e._id === btn.dataset.edit);
      btn.addEventListener('click', () => openExpenseModal(expense, _phases));
    });

    tbody.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => deleteExpense(btn.dataset.delete));
    });

    // Paginación
    tbody.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _currentPage = parseInt(btn.dataset.page);
        loadExpenses();
      });
    });

  } catch (err) {
    tbody.innerHTML = errorStateHTML(err.message);
  }
};

const applyFilters = () => {
  _filters = {};
  const cat = document.getElementById('filter-category')?.value;
  const phase = document.getElementById('filter-phase')?.value;
  const start = document.getElementById('filter-start')?.value;
  const end = document.getElementById('filter-end')?.value;
  if (cat) _filters.category = cat;
  if (phase) _filters.phase = phase;
  if (start) _filters.startDate = start;
  if (end) _filters.endDate = end;
  _currentPage = 1;
  loadExpenses();
};

const clearFilters = () => {
  _filters = {};
  _currentPage = 1;
  ['filter-category', 'filter-phase'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['filter-start', 'filter-end'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  loadExpenses();
};

const openExpenseModal = (expense, phases) => {
  const isEdit = !!expense;
  modal.open({
    title: isEdit ? 'Editar Gasto' : 'Nuevo Gasto',
    body: `
      <form id="expense-form">
        <div class="form-row">
          <div class="form-group">
            <label>Fecha</label>
            <input type="date" name="date" value="${formatDateInput(expense?.date)}" required>
          </div>
          <div class="form-group">
            <label>Monto (COP)</label>
            <input type="number" name="amount" value="${expense?.amount || ''}" placeholder="0" min="0" required>
          </div>
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <input type="text" name="description" value="${expense?.description || ''}" placeholder="Ej: Jornales limpieza..." required maxlength="500">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Categoría</label>
            <select name="category" required>
              <option value="">Seleccionar...</option>
              ${['trabajadores','maquinaria','insumos','alquiler','otros'].map(c =>
                `<option value="${c}" ${expense?.category === c ? 'selected' : ''}>${catLabel(c)}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Fase (opcional)</label>
            <select name="phase">
              <option value="">Sin fase</option>
              ${phases.map(p =>
                `<option value="${p._id}" ${expense?.phase?._id === p._id || expense?.phase === p._id ? 'selected' : ''}>${p.name}</option>`
              ).join('')}
            </select>
          </div>
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="modal-submit-btn" data-original-text="${isEdit ? 'Actualizar' : 'Guardar'}">
        ${isEdit ? 'Actualizar' : 'Guardar'}
      </button>
    `
  });

  document.getElementById('modal-cancel')?.addEventListener('click', () => modal.close());
  document.getElementById('modal-submit-btn')?.addEventListener('click', async () => {
    const form = document.getElementById('expense-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const fd = new FormData(form);
    const data = Object.fromEntries(fd);
    if (!data.phase) delete data.phase;

    modal.setLoading(true);
    try {
      if (isEdit) {
        await expenseService.update(expense._id, data);
        toast.success('Gasto actualizado');
      } else {
        await expenseService.create(data);
        toast.success('Gasto registrado');
      }
      modal.close();
      await loadSummary();
      await loadExpenses();
    } catch (err) {
      toast.error(err.message);
    } finally {
      modal.setLoading(false);
    }
  });
};

const deleteExpense = async (id) => {
  if (!confirm('¿Eliminar este gasto?')) return;
  try {
    await expenseService.delete(id);
    toast.success('Gasto eliminado');
    await loadSummary();
    await loadExpenses();
  } catch (err) {
    toast.error(err.message);
  }
};

const renderPagination = ({ total, page, pages }) => {
  if (pages <= 1) return '';
  return `
    <div class="pagination">
      <button class="page-btn" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''}>←</button>
      ${Array.from({ length: pages }, (_, i) => `
        <button class="page-btn ${i + 1 === page ? 'active' : ''}" data-page="${i + 1}">${i + 1}</button>
      `).join('')}
      <button class="page-btn" data-page="${page + 1}" ${page === pages ? 'disabled' : ''}>→</button>
    </div>
  `;
};

const catLabel = (cat) => ({
  trabajadores: 'Trabajadores',
  maquinaria: 'Maquinaria',
  insumos: 'Insumos',
  alquiler: 'Alquiler Terreno',
  otros: 'Otros',
  arriendo: 'Arriendo'
}[cat] || cat);
