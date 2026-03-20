const CalendarEvent = require('../models/CalendarEvent');

const getEvents = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const filter = {};

    if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1);
      const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const events = await CalendarEvent.find(filter)
      .populate('phase', 'name order')
      .populate('createdBy', 'name')
      .sort({ date: 1 });

    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const { title, date, type, phase, notes } = req.body;
    const event = await CalendarEvent.create({
      title, date, type,
      phase: phase || null,
      notes, createdBy: req.user._id
    });
    await event.populate('phase', 'name order');
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const event = await CalendarEvent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('phase', 'name order');

    if (!event) return res.status(404).json({ success: false, message: 'Evento no encontrado' });
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await CalendarEvent.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Evento no encontrado' });
    res.json({ success: true, message: 'Evento eliminado' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getEvents, createEvent, updateEvent, deleteEvent };
