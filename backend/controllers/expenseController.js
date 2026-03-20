const Expense = require('../models/Expense');

const getExpenses = async (req, res, next) => {
  try {
    const { category, phase, startDate, endDate, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (phase) filter.phase = phase;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .populate('phase', 'name order')
        .populate('createdBy', 'name')
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Expense.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const createExpense = async (req, res, next) => {
  try {
    const { date, amount, description, category, phase } = req.body;
    const expense = await Expense.create({
      date, amount, description, category,
      phase: phase || null,
      createdBy: req.user._id
    });
    await expense.populate('phase', 'name order');
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('phase', 'name order');

    if (!expense) return res.status(404).json({ success: false, message: 'Gasto no encontrado' });
    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Gasto no encontrado' });
    res.json({ success: true, message: 'Gasto eliminado' });
  } catch (error) {
    next(error);
  }
};

const getExpenseSummary = async (req, res, next) => {
  try {
    const [byCategory, byPhase, totalResult] = await Promise.all([
      Expense.aggregate([
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Expense.aggregate([
        { $match: { phase: { $ne: null } } },
        { $group: { _id: '$phase', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $lookup: { from: 'phases', localField: '_id', foreignField: '_id', as: 'phaseInfo' } },
        { $unwind: { path: '$phaseInfo', preserveNullAndEmpty: true } },
        { $project: { total: 1, count: 1, phaseName: '$phaseInfo.name', phaseOrder: '$phaseInfo.order' } }
      ]),
      Expense.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        byCategory,
        byPhase,
        total: totalResult[0]?.total || 0,
        count: totalResult[0]?.count || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense, getExpenseSummary };
