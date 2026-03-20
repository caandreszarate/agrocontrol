const Expense = require('../models/Expense');
const Phase = require('../models/Phase');
const ScheduledPayment = require('../models/ScheduledPayment');
const ProductionRecord = require('../models/ProductionRecord');
const CalendarEvent = require('../models/CalendarEvent');

const getDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    const in7days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      expenseSummary,
      phases,
      pendingPayments,
      productionSummary,
      upcomingEvents,
      recentExpenses,
      monthlyExpenses
    ] = await Promise.all([
      // Total gastos
      Expense.aggregate([
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      // Fases
      Phase.find().sort({ order: 1 }),
      // Pagos próximos (sin pagar, próximos 7 días + vencidos)
      ScheduledPayment.find({
        isPaid: false,
        dueDate: { $lte: in7days }
      }).sort({ dueDate: 1 }).limit(5),
      // Producción total
      ProductionRecord.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: '$totalRevenue' }, totalBunches: { $sum: '$bunchesHarvested' } } }
      ]),
      // Próximos eventos (7 días)
      CalendarEvent.find({
        date: { $gte: today, $lte: in7days }
      }).sort({ date: 1 }).limit(5),
      // Últimos 5 gastos
      Expense.find().sort({ createdAt: -1 }).limit(5).populate('phase', 'name'),
      // Gastos por mes (últimos 6 meses)
      Expense.aggregate([
        {
          $match: {
            date: { $gte: new Date(today.getFullYear(), today.getMonth() - 5, 1) }
          }
        },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            total: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    // Calcular totales
    const totalExpenses = expenseSummary.reduce((sum, c) => sum + c.total, 0);
    const totalRevenue = productionSummary[0]?.totalRevenue || 0;
    const profit = totalRevenue - totalExpenses;

    // Días desde inicio (primera fase con startDate)
    const firstPhase = phases.find(p => p.startDate);
    const daysSinceStart = firstPhase
      ? Math.floor((today - new Date(firstPhase.startDate)) / (1000 * 60 * 60 * 24))
      : 0;

    // Progreso general del proyecto
    const activePhases = phases.filter(p => p.status !== 'pending');
    const avgProgress = activePhases.length > 0
      ? Math.round(activePhases.reduce((sum, p) => sum + p.progressPercent, 0) / phases.length)
      : 0;

    res.json({
      success: true,
      data: {
        kpis: {
          totalExpenses,
          totalRevenue,
          profit,
          daysSinceStart,
          projectProgress: avgProgress,
          totalBunches: productionSummary[0]?.totalBunches || 0
        },
        expensesByCategory: expenseSummary,
        phases,
        pendingPayments,
        upcomingEvents,
        recentExpenses,
        monthlyExpenses,
        alerts: pendingPayments.map(p => ({
          id: p._id,
          description: p.description,
          amount: p.amount,
          dueDate: p.dueDate,
          isOverdue: p.dueDate < today,
          category: p.category
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
