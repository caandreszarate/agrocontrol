const ScheduledPayment = require('../models/ScheduledPayment');

const getPayments = async (req, res, next) => {
  try {
    const { isPaid, startDate, endDate } = req.query;
    const filter = {};

    if (isPaid !== undefined) filter.isPaid = isPaid === 'true';
    if (startDate || endDate) {
      filter.dueDate = {};
      if (startDate) filter.dueDate.$gte = new Date(startDate);
      if (endDate) filter.dueDate.$lte = new Date(endDate);
    }

    const payments = await ScheduledPayment.find(filter)
      .populate('createdBy', 'name')
      .sort({ dueDate: 1 });

    // Alertas: pagos vencidos o próximos (7 días)
    const today = new Date();
    const in7days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const alerts = payments.filter(p =>
      !p.isPaid && p.dueDate <= in7days
    ).map(p => ({
      id: p._id,
      description: p.description,
      amount: p.amount,
      dueDate: p.dueDate,
      isOverdue: p.dueDate < today
    }));

    res.json({ success: true, data: payments, alerts });
  } catch (error) {
    next(error);
  }
};

const createPayment = async (req, res, next) => {
  try {
    const { description, amount, dueDate, category, notes } = req.body;
    const payment = await ScheduledPayment.create({
      description, amount, dueDate, category, notes,
      createdBy: req.user._id
    });
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

const updatePayment = async (req, res, next) => {
  try {
    const payment = await ScheduledPayment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!payment) return res.status(404).json({ success: false, message: 'Pago no encontrado' });
    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

const markAsPaid = async (req, res, next) => {
  try {
    const { paidAmount } = req.body;
    const payment = await ScheduledPayment.findByIdAndUpdate(
      req.params.id,
      { isPaid: true, paidAt: new Date(), paidAmount: paidAmount || undefined },
      { new: true }
    );
    if (!payment) return res.status(404).json({ success: false, message: 'Pago no encontrado' });
    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

const deletePayment = async (req, res, next) => {
  try {
    const payment = await ScheduledPayment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Pago no encontrado' });
    res.json({ success: true, message: 'Pago eliminado' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPayments, createPayment, updatePayment, markAsPaid, deletePayment };
