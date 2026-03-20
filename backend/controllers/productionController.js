const ProductionRecord = require('../models/ProductionRecord');
const Expense = require('../models/Expense');

const getProduction = async (req, res, next) => {
  try {
    const { startDate, endDate, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [records, total] = await Promise.all([
      ProductionRecord.find(filter)
        .populate('createdBy', 'name')
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ProductionRecord.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: records,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit) }
    });
  } catch (error) {
    next(error);
  }
};

const createProduction = async (req, res, next) => {
  try {
    const { date, bunchesHarvested, weightKg, pricePerKg, notes } = req.body;
    const record = await ProductionRecord.create({
      date, bunchesHarvested, weightKg, pricePerKg,
      notes, createdBy: req.user._id
    });
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

const updateProduction = async (req, res, next) => {
  try {
    const record = await ProductionRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Registro no encontrado' });

    Object.assign(record, req.body);
    record.totalRevenue = record.weightKg * record.pricePerKg;
    await record.save();

    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

const deleteProduction = async (req, res, next) => {
  try {
    const record = await ProductionRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Registro no encontrado' });
    res.json({ success: true, message: 'Registro eliminado' });
  } catch (error) {
    next(error);
  }
};

const getProductionSummary = async (req, res, next) => {
  try {
    const [summary, totalExpenses] = await Promise.all([
      ProductionRecord.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalRevenue' },
            totalWeightKg: { $sum: '$weightKg' },
            totalBunches: { $sum: '$bunchesHarvested' },
            avgPricePerKg: { $avg: '$pricePerKg' },
            records: { $sum: 1 }
          }
        }
      ]),
      Expense.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const revenue = summary[0]?.totalRevenue || 0;
    const expenses = totalExpenses[0]?.total || 0;
    const profit = revenue - expenses;

    res.json({
      success: true,
      data: {
        ...summary[0],
        totalExpenses: expenses,
        profit,
        roi: expenses > 0 ? ((profit / expenses) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProduction, createProduction, updateProduction, deleteProduction, getProductionSummary };
