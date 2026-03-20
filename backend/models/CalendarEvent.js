const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [200, 'Título máximo 200 caracteres']
  },
  date: {
    type: Date,
    required: [true, 'La fecha es requerida']
  },
  type: {
    type: String,
    enum: ['abono', 'limpieza', 'cosecha', 'pago', 'siembra', 'otro'],
    default: 'otro'
  },
  phase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Phase',
    default: null
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notas máximo 500 caracteres'],
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

calendarEventSchema.index({ date: 1 });
calendarEventSchema.index({ type: 1 });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
