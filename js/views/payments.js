// ===================================================
// Vista Pagos Programados
// ===================================================
import { paymentService } from '../../services/paymentService.js';
import { formatCurrency, formatDate, formatDateInput, relativeDate, loadingHTML, errorStateHTML, emptyStateHTML } from '../ui.js';
import { modal } from '../../components/modal.js';
import { toast } from '../../components/toast.js';
import State from '../state.js';

export const renderPayments = async (container) => {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Pagos Programados</h1>
        <p class="page-subtitle">Agenda de compromisos financieros</p>
      </div>
      ${State.isAdmin() ? '<button class="btn btn-primary" id="new-payment-btn">+ Nuevo Pago</button>' : ''}
    </div>
    <div class="filters-bar">
      <select id="filter-paid">
        <option value="">Todos</option>
        <option value="false">Pendientes</option>
        <option value="true">Pagados</option>
      </select>
    </div>
    <div id="payments-list">${loadingHTML()}</div>
  `;

  document.getElementById('new-payment-btn')?.addEventListener('click', () => openPaymentModal(null));
  document.getElementById('filter-paid')?.addEventListener('change', (e) => loadPayments(e.target.value));

  await loadPayments('false');
};

const loadPayments = async (isPaid = '') => {
  const list = document.getElementById('payments-list');
  if (!list) return;
  list.innerHTML = loadingHTML();

  try {
    const params = {};
    if (isPaid !== '') params.isPaid = isPaid;
    const res = await paymentService.getAll(params);
    const { data: payments, alerts } = res;

    if (payments.length === 0) {
      list.innerHTML = emptyStateHTML('📅', 'Sin pagos programados', 'Registra compromisos de pago para recibir alertas');
      return;
    }

    // Separar vencidos, próximos y pagados
    const today = new Date();
    const overdue = payments.filter(p => !p.isPaid && new Date(p.dueDate) < today);
    const upcoming = payments.filter(p => !p.isPaid && new Date(p.dueDate) >= today);
    const paid = payments.filter(p => p.isPaid);

    list.innerHTML = `
      ${overdue.length > 0 ? `
        <div style="margin-bottom:1.5rem">
          <h3 style="font-size:0.875rem;font-weight:700;color:var(--color-danger);margin-bottom:0.75rem;text-transform:uppercase;letter-spacing:.05em">
            ⚠️ Vencidos (${overdue.length})
          </h3>
          <div style="display:flex;flex-direction:column;gap:0.5rem">
            ${overdue.map(p => paymentCardHTML(p, 'overdue')).join('')}
          </div>
        </div>
      ` : ''}

      ${upcoming.length > 0 ? `
        <div style="margin-bottom:1.5rem">
          <h3 style="font-size:0.875rem;font-weight:700;color:var(--color-warning);margin-bottom:0.75rem;text-transform:uppercase;letter-spacing:.05em">
            📅 Próximos (${upcoming.length})
          </h3>
          <div style="display:flex;flex-direction:column;gap:0.5rem">
            ${upcoming.map(p => paymentCardHTML(p, 'upcoming')).join('')}
          </div>
        </div>
      ` : ''}

      ${paid.length > 0 ? `
        <div>
          <h3 style="font-size:0.875rem;font-weight:700;color:var(--color-success);margin-bottom:0.75rem;text-transform:uppercase;letter-spacing:.05em">
            ✅ Pagados (${paid.length})
          </h3>
          <div style="display:flex;flex-direction:column;gap:0.5rem">
            ${paid.map(p => paymentCardHTML(p, 'paid')).join('')}
          </div>
        </div>
      ` : ''}
    `;

    // Eventos
    list.querySelectorAll('[data-edit-payment]').forEach(btn => {
      const payment = payments.find(p => p._id === btn.dataset.editPayment);
      btn.addEventListener('click', () => openPaymentModal(payment));
    });

    list.querySelectorAll('[data-pay]').forEach(btn => {
      btn.addEventListener('click', () => markPaid(btn.dataset.pay, payments));
    });

    list.querySelectorAll('[data-delete-payment]').forEach(btn => {
      btn.addEventListener('click', () => deletePayment(btn.dataset.deletePayment));
    });

  } catch (err) {
    list.innerHTML = errorStateHTML(err.message);
  }
};

const paymentCardHTML = (p, type) => {
  const today = new Date();
  const daysLabel = relativeDate(p.dueDate);

  return `
    <div class="payment-card ${type}" style="gap:1rem">
      <div class="payment-dot ${type}"></div>
      <div class="payment-info" style="flex:1">
        <div class="payment-desc">${p.description}</div>
        <div class="payment-date">
          ${type === 'overdue' ? '⚠️' : type === 'paid' ? '✅' : '📅'}
          ${formatDate(p.dueDate)} · ${daysLabel}
          <span class="cat-badge ${p.category}" style="margin-left:0.5rem">${p.category}</span>
        </div>
        ${p.notes ? `<div style="font-size:0.75rem;color:var(--color-text-tertiary);margin-top:2px">${p.notes}</div>` : ''}
      </div>
      <div style="text-align:right">
        <div class="payment-amount">${formatCurrency(p.amount)}</div>
        ${p.isPaid ? `<div style="font-size:0.75rem;color:var(--color-success)">Pagado ${formatDate(p.paidAt)}</div>` : ''}
      </div>
      ${State.isAdmin() && !p.isPaid ? `
        <div class="flex gap-2">
          <button class="btn btn-primary btn-sm" data-pay="${p._id}">✓ Pagar</button>
          <button class="btn btn-ghost btn-sm" data-edit-payment="${p._id}">✏️</button>
          <button class="btn btn-ghost btn-sm" data-delete-payment="${p._id}">🗑️</button>
        </div>
      ` : State.isAdmin() ? `
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-sm" data-delete-payment="${p._id}">🗑️</button>
        </div>
      ` : ''}
    </div>
  `;
};

const openPaymentModal = (payment) => {
  const isEdit = !!payment;
  modal.open({
    title: isEdit ? 'Editar Pago' : 'Nuevo Pago Programado',
    body: `
      <form id="payment-form">
        <div class="form-group">
          <label>Descripción</label>
          <input type="text" name="description" value="${payment?.description || ''}" placeholder="Ej: Arriendo mensual terreno" required maxlength="300">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Monto (COP)</label>
            <input type="number" name="amount" value="${payment?.amount || ''}" min="0" required>
          </div>
          <div class="form-group">
            <label>Fecha vencimiento</label>
            <input type="date" name="dueDate" value="${formatDateInput(payment?.dueDate)}" required>
          </div>
        </div>
        <div class="form-group">
          <label>Categoría</label>
          <select name="category">
            ${['trabajadores','maquinaria','insumos','arriendo','otros'].map(c =>
              `<option value="${c}" ${payment?.category === c ? 'selected' : ''}>${c.charAt(0).toUpperCase() + c.slice(1)}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Notas (opcional)</label>
          <textarea name="notes" rows="2" placeholder="Observaciones...">${payment?.notes || ''}</textarea>
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
    const form = document.getElementById('payment-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = Object.fromEntries(new FormData(form));

    modal.setLoading(true);
    try {
      if (isEdit) {
        await paymentService.update(payment._id, data);
        toast.success('Pago actualizado');
      } else {
        await paymentService.create(data);
        toast.success('Pago programado creado');
      }
      modal.close();
      const isPaid = document.getElementById('filter-paid')?.value || 'false';
      await loadPayments(isPaid);
    } catch (err) {
      toast.error(err.message);
    } finally {
      modal.setLoading(false);
    }
  });
};

const markPaid = async (id, payments) => {
  const payment = payments.find(p => p._id === id);
  if (!confirm(`¿Marcar "${payment?.description}" como pagado?`)) return;
  try {
    await paymentService.markAsPaid(id);
    toast.success('Pago registrado como pagado');
    await loadPayments('false');
  } catch (err) {
    toast.error(err.message);
  }
};

const deletePayment = async (id) => {
  if (!confirm('¿Eliminar este pago programado?')) return;
  try {
    await paymentService.delete(id);
    toast.success('Pago eliminado');
    await loadPayments('');
  } catch (err) {
    toast.error(err.message);
  }
};
