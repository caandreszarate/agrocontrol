// ===================================================
// Vista Calendario Agrícola
// ===================================================
import { calendarService } from '../../services/calendarService.js';
import { formatDate, formatDateInput, loadingHTML, errorStateHTML } from '../ui.js';
import { modal } from '../../components/modal.js';
import { toast } from '../../components/toast.js';
import State from '../state.js';

let _currentDate = new Date();
let _events = [];

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

const EVENT_COLORS = {
  abono: '#22c55e',
  limpieza: '#3b82f6',
  cosecha: '#f59e0b',
  pago: '#ef4444',
  siembra: '#8b5cf6',
  otro: '#64748b'
};

export const renderCalendar = async (container) => {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Calendario Agrícola</h1>
        <p class="page-subtitle">Actividades y eventos del cultivo</p>
      </div>
      ${State.isAdmin() ? '<button class="btn btn-primary" id="new-event-btn">+ Nuevo Evento</button>' : ''}
    </div>
    <div class="card">
      <div id="calendar-nav" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem">
        <button class="btn btn-ghost" id="prev-month">← Anterior</button>
        <h2 id="calendar-title" style="font-size:1.25rem;font-weight:700"></h2>
        <button class="btn btn-ghost" id="next-month">Siguiente →</button>
      </div>
      <div id="calendar-grid"></div>
    </div>
    <div class="card" style="margin-top:1.5rem">
      <div class="card-header">
        <h3 class="card-title">Eventos del mes</h3>
      </div>
      <div id="events-list"></div>
    </div>
  `;

  document.getElementById('new-event-btn')?.addEventListener('click', () => openEventModal(null));
  document.getElementById('prev-month')?.addEventListener('click', () => {
    _currentDate = new Date(_currentDate.getFullYear(), _currentDate.getMonth() - 1, 1);
    loadCalendar();
  });
  document.getElementById('next-month')?.addEventListener('click', () => {
    _currentDate = new Date(_currentDate.getFullYear(), _currentDate.getMonth() + 1, 1);
    loadCalendar();
  });

  await loadCalendar();
};

const loadCalendar = async () => {
  const grid = document.getElementById('calendar-grid');
  const title = document.getElementById('calendar-title');
  const eventsList = document.getElementById('events-list');

  if (title) title.textContent = `${MONTHS[_currentDate.getMonth()]} ${_currentDate.getFullYear()}`;

  try {
    const res = await calendarService.getEvents(_currentDate.getMonth() + 1, _currentDate.getFullYear());
    _events = res.data;

    renderGrid(_events);
    renderEventsList(_events);
  } catch (err) {
    if (grid) grid.innerHTML = errorStateHTML(err.message);
  }
};

const renderGrid = (events) => {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;

  const year = _currentDate.getFullYear();
  const month = _currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const today = new Date();

  // Agrupar eventos por día
  const eventsByDay = {};
  events.forEach(e => {
    const day = new Date(e.date).getDate();
    if (!eventsByDay[day]) eventsByDay[day] = [];
    eventsByDay[day].push(e);
  });

  let html = `
    <div class="calendar-grid">
      ${DAYS.map(d => `<div class="calendar-day-header">${d}</div>`).join('')}
  `;

  // Días del mes anterior
  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<div class="calendar-day other-month"><div class="day-number">${daysInPrev - i}</div></div>`;
  }

  // Días del mes actual
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const dayEvents = eventsByDay[d] || [];

    html += `
      <div class="calendar-day ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}"
           ${State.isAdmin() ? `data-create-day="${d}"` : ''}>
        <div class="day-number">${d}</div>
        <div class="day-events">
          ${dayEvents.slice(0, 3).map(e => `
            <div class="day-event-dot"
                 style="background:${EVENT_COLORS[e.type] || '#64748b'}"
                 title="${e.title}">
              ${e.title.length > 12 ? e.title.slice(0, 12) + '…' : e.title}
            </div>
          `).join('')}
          ${dayEvents.length > 3 ? `<div style="font-size:10px;color:var(--color-text-tertiary)">+${dayEvents.length - 3} más</div>` : ''}
        </div>
      </div>
    `;
  }

  // Días del mes siguiente
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  for (let d = 1; d <= totalCells - firstDay - daysInMonth; d++) {
    html += `<div class="calendar-day other-month"><div class="day-number">${d}</div></div>`;
  }

  html += '</div>';
  grid.innerHTML = html;

  // Click en día para crear evento
  if (State.isAdmin()) {
    grid.querySelectorAll('[data-create-day]').forEach(dayEl => {
      dayEl.addEventListener('click', () => {
        const d = parseInt(dayEl.dataset.createDay);
        const date = new Date(_currentDate.getFullYear(), _currentDate.getMonth(), d);
        openEventModal(null, date);
      });
    });
  }
};

const renderEventsList = (events) => {
  const list = document.getElementById('events-list');
  if (!list) return;

  if (events.length === 0) {
    list.innerHTML = '<p class="text-secondary text-sm" style="text-align:center;padding:1.5rem">Sin eventos este mes</p>';
    return;
  }

  list.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:0.5rem">
      ${events.map(e => `
        <div style="display:flex;align-items:center;gap:1rem;padding:0.75rem;border-radius:8px;background:var(--color-bg-tertiary)">
          <div style="width:12px;height:12px;border-radius:50%;background:${EVENT_COLORS[e.type]};flex-shrink:0"></div>
          <div style="flex:1">
            <div style="font-weight:600;font-size:0.875rem">${e.title}</div>
            <div style="font-size:0.75rem;color:var(--color-text-tertiary)">
              ${formatDate(e.date)} · <span style="color:${EVENT_COLORS[e.type]}">${e.type}</span>
              ${e.phase ? ` · ${e.phase.name}` : ''}
            </div>
            ${e.notes ? `<div style="font-size:0.75rem;color:var(--color-text-secondary);margin-top:2px">${e.notes}</div>` : ''}
          </div>
          ${State.isAdmin() ? `
            <div class="flex gap-2">
              <button class="btn btn-ghost btn-sm" data-edit-event="${e._id}">✏️</button>
              <button class="btn btn-ghost btn-sm" data-delete-event="${e._id}">🗑️</button>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;

  list.querySelectorAll('[data-edit-event]').forEach(btn => {
    const ev = events.find(e => e._id === btn.dataset.editEvent);
    btn.addEventListener('click', () => openEventModal(ev));
  });

  list.querySelectorAll('[data-delete-event]').forEach(btn => {
    btn.addEventListener('click', () => deleteEvent(btn.dataset.deleteEvent));
  });
};

const openEventModal = (event, presetDate = null) => {
  const isEdit = !!event;
  const dateVal = event ? formatDateInput(event.date)
    : presetDate ? presetDate.toISOString().split('T')[0]
    : '';

  modal.open({
    title: isEdit ? 'Editar Evento' : 'Nuevo Evento',
    body: `
      <form id="event-form">
        <div class="form-group">
          <label>Título</label>
          <input type="text" name="title" value="${event?.title || ''}" placeholder="Ej: Aplicación de abono" required maxlength="200">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Fecha</label>
            <input type="date" name="date" value="${dateVal}" required>
          </div>
          <div class="form-group">
            <label>Tipo</label>
            <select name="type">
              ${['abono','limpieza','cosecha','pago','siembra','otro'].map(t =>
                `<option value="${t}" ${event?.type === t ? 'selected' : ''}>${t.charAt(0).toUpperCase() + t.slice(1)}</option>`
              ).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Notas (opcional)</label>
          <textarea name="notes" rows="2">${event?.notes || ''}</textarea>
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
    const form = document.getElementById('event-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = Object.fromEntries(new FormData(form));

    modal.setLoading(true);
    try {
      if (isEdit) {
        await calendarService.update(event._id, data);
        toast.success('Evento actualizado');
      } else {
        await calendarService.create(data);
        toast.success('Evento creado');
      }
      modal.close();
      await loadCalendar();
    } catch (err) {
      toast.error(err.message);
    } finally {
      modal.setLoading(false);
    }
  });
};

const deleteEvent = async (id) => {
  if (!confirm('¿Eliminar este evento?')) return;
  try {
    await calendarService.delete(id);
    toast.success('Evento eliminado');
    await loadCalendar();
  } catch (err) {
    toast.error(err.message);
  }
};
