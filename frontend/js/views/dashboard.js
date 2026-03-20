// ===================================================
// Vista Dashboard
// ===================================================
import { dashboardService } from '../../services/dashboardService.js';
import { formatCurrency, formatDate, loadingHTML, errorStateHTML, statusBadge } from '../ui.js';
import { renderHeader } from '../../components/header.js';

let chartsLoaded = false;

export const renderDashboard = async (container) => {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Resumen general del cultivo — Granada, Meta</p>
      </div>
    </div>
    ${loadingHTML('Cargando datos del cultivo...')}
  `;

  try {
    const res = await dashboardService.getData();
    const { kpis, expensesByCategory, phases, pendingPayments, recentExpenses, monthlyExpenses, alerts } = res.data;

    // Re-render header con alertas
    renderHeader(alerts);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Granada, Meta — Cultivo plátano hartón</p>
        </div>
      </div>

      ${alerts.length > 0 ? `
        <div class="alert-banner">
          🔔 <strong>${alerts.length} pago${alerts.length > 1 ? 's' : ''} pendiente${alerts.length > 1 ? 's' : ''}</strong>
          — ${alerts.filter(a => a.isOverdue).length > 0 ? `${alerts.filter(a => a.isOverdue).length} vencido(s)` : 'próximos a vencer'}
          <a href="#/payments" style="margin-left:auto;color:inherit;font-weight:700">Ver todos →</a>
        </div>
      ` : ''}

      <!-- KPIs -->
      <div class="grid-kpi">
        ${kpiCard('💸', 'Total Gastos', formatCurrency(kpis.totalExpenses, true), '', '#ef4444', '#fef2f2')}
        ${kpiCard('🍌', 'Ingresos Producción', formatCurrency(kpis.totalRevenue, true), '', '#22c55e', '#f0fdf4')}
        ${kpiCard('📈', 'Utilidad', formatCurrency(kpis.profit, true),
          kpis.profit >= 0 ? 'up' : 'down', '#3b82f6', '#eff6ff')}
        ${kpiCard('📅', 'Días del Proyecto', kpis.daysSinceStart > 0 ? `${kpis.daysSinceStart} días` : 'No iniciado', '', '#f59e0b', '#fffbeb')}
        ${kpiCard('🌱', 'Progreso General', `${kpis.projectProgress}%`, '', '#8b5cf6', '#f5f3ff')}
        ${kpiCard('🌾', 'Racimos Cosechados', kpis.totalBunches.toLocaleString(), '', '#22c55e', '#f0fdf4')}
      </div>

      <div class="grid-2">
        <!-- Gastos por categoría -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Gastos por Categoría</h3>
          </div>
          <div class="chart-container">
            <canvas id="chart-categories"></canvas>
          </div>
          <div style="margin-top:1rem">
            ${expensesByCategory.map(c => `
              <div class="stat-item">
                <span class="stat-label">${catLabel(c._id)}</span>
                <span class="stat-value">${formatCurrency(c.total)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Gastos por mes -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Gastos Mensuales</h3>
          </div>
          <div class="chart-container">
            <canvas id="chart-monthly"></canvas>
          </div>
        </div>
      </div>

      <div class="grid-2" style="margin-top:1.5rem">
        <!-- Fases -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Fases del Cultivo</h3>
            <a href="#/phases" class="btn btn-ghost btn-sm">Ver todo →</a>
          </div>
          <div style="display:flex;flex-direction:column;gap:0.75rem">
            ${phases.slice(0, 5).map(p => `
              <div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
                  <span style="font-size:0.875rem;font-weight:500;color:var(--color-text)">${p.name}</span>
                  <span style="font-size:0.75rem;color:var(--color-text-secondary)">${p.progressPercent}%</span>
                </div>
                <div class="progress-bar-wrap">
                  <div class="progress-bar" style="width:${p.progressPercent}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Pagos pendientes -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Próximos Pagos</h3>
            <a href="#/payments" class="btn btn-ghost btn-sm">Ver todo →</a>
          </div>
          <div style="display:flex;flex-direction:column;gap:0.5rem">
            ${pendingPayments.length === 0
              ? '<p class="text-secondary" style="text-align:center;padding:1rem">Sin pagos pendientes 🎉</p>'
              : pendingPayments.map(p => {
                  const overdue = new Date(p.dueDate) < new Date();
                  return `
                    <div class="payment-card ${overdue ? 'overdue' : 'upcoming'}">
                      <div class="payment-dot ${overdue ? 'overdue' : 'upcoming'}"></div>
                      <div class="payment-info">
                        <div class="payment-desc">${p.description}</div>
                        <div class="payment-date">${overdue ? '⚠️ Vencido' : '📅'} ${formatDate(p.dueDate)}</div>
                      </div>
                      <div class="payment-amount">${formatCurrency(p.amount)}</div>
                    </div>
                  `;
                }).join('')
            }
          </div>
        </div>
      </div>

      <!-- Últimos gastos -->
      <div class="card" style="margin-top:1.5rem">
        <div class="card-header">
          <h3 class="card-title">Últimos Gastos</h3>
          <a href="#/expenses" class="btn btn-ghost btn-sm">Ver todo →</a>
        </div>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Fase</th>
                <th style="text-align:right">Monto</th>
              </tr>
            </thead>
            <tbody>
              ${recentExpenses.map(e => `
                <tr>
                  <td>${formatDate(e.date)}</td>
                  <td>${e.description}</td>
                  <td><span class="cat-badge ${e.category}">${catLabel(e.category)}</span></td>
                  <td>${e.phase?.name || '—'}</td>
                  <td style="text-align:right;font-weight:600">${formatCurrency(e.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Cargar Chart.js y gráficas
    loadCharts(expensesByCategory, monthlyExpenses);

  } catch (err) {
    container.innerHTML = `
      <div class="page-header"><h1 class="page-title">Dashboard</h1></div>
      ${errorStateHTML(err.message)}
    `;
  }
};

const kpiCard = (icon, label, value, trend, accent, accentBg) => `
  <div class="kpi-card" style="--kpi-accent:${accent};--kpi-accent-bg:${accentBg}">
    <div class="kpi-icon">${icon}</div>
    <div class="kpi-label">${label}</div>
    <div class="kpi-value">${value}</div>
    ${trend ? `<div class="kpi-trend ${trend}">${trend === 'up' ? '▲ Positivo' : '▼ Negativo'}</div>` : ''}
  </div>
`;

const catLabel = (cat) => ({
  trabajadores: 'Trabajadores',
  maquinaria: 'Maquinaria',
  insumos: 'Insumos',
  otros: 'Otros',
  arriendo: 'Arriendo'
}[cat] || cat);

const loadCharts = async (byCategory, monthly) => {
  if (!window.Chart) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    document.head.appendChild(script);
    await new Promise(r => { script.onload = r; });
  }

  const catCanvas = document.getElementById('chart-categories');
  const monthCanvas = document.getElementById('chart-monthly');

  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim();
  const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim();

  if (catCanvas && byCategory.length > 0) {
    new Chart(catCanvas, {
      type: 'doughnut',
      data: {
        labels: byCategory.map(c => catLabel(c._id)),
        datasets: [{
          data: byCategory.map(c => c.total),
          backgroundColor: ['#8b5cf6', '#f59e0b', '#22c55e', '#64748b', '#ef4444'],
          borderWidth: 0,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { color: textColor, padding: 16, font: { size: 12 } } }
        }
      }
    });
  }

  if (monthCanvas && monthly.length > 0) {
    const labels = monthly.map(m => {
      const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      return `${months[m._id.month - 1]} ${m._id.year}`;
    });

    new Chart(monthCanvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Gastos (COP)',
          data: monthly.map(m => m.total),
          backgroundColor: 'rgba(34,197,94,0.2)',
          borderColor: '#22c55e',
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            ticks: {
              color: textColor,
              callback: (v) => `$${(v / 1000).toFixed(0)}K`
            },
            grid: { color: borderColor }
          },
          x: { ticks: { color: textColor }, grid: { display: false } }
        }
      }
    });
  }
};
