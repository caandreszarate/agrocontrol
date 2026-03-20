const Phase = require('../models/Phase');
const Expense = require('../models/Expense');

const getPhases = async (req, res, next) => {
  try {
    const phases = await Phase.find().sort({ order: 1 });
    res.json({ success: true, data: phases });
  } catch (error) {
    next(error);
  }
};

const updatePhase = async (req, res, next) => {
  try {
    const allowed = ['status', 'startDate', 'endDate', 'progressPercent', 'notes', 'imageUrls'];
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Auto-ajustar estado según progreso
    if (updates.progressPercent !== undefined) {
      if (updates.progressPercent === 0) updates.status = 'pending';
      else if (updates.progressPercent === 100) updates.status = 'completed';
      else updates.status = 'in_progress';
    }

    const phase = await Phase.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!phase) return res.status(404).json({ success: false, message: 'Fase no encontrada' });
    res.json({ success: true, data: phase });
  } catch (error) {
    next(error);
  }
};

const getPhaseWithExpenses = async (req, res, next) => {
  try {
    const [phase, expenses] = await Promise.all([
      Phase.findById(req.params.id),
      Expense.find({ phase: req.params.id }).sort({ date: -1 })
    ]);

    if (!phase) return res.status(404).json({ success: false, message: 'Fase no encontrada' });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    res.json({ success: true, data: { phase, expenses, total } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPhases, updatePhase, getPhaseWithExpenses };
