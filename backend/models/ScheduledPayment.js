const mongoose = require('mongoose');

const scheduledPaymentSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    maxlength: [300, 'Descripción máximo 300 caracteres']
  },
  amount: {
    type: Number,
    required: [true, 'El monto es requerido'],
    min: [0, 'El monto no puede ser negativo']
  },
  dueDate: {
    type: Date,
    required: [true, 'La fecha de vencimiento es requerida']
  },
  category: {
    type: String,
    enum: ['trabajadores', 'maquinaria', 'insumos', 'arriendo', 'otros'],
    default: 'otros'
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date,
    default: null
  },
  paidAmount: {
    type: Number,
    default: null
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

scheduledPaymentSchema.index({ dueDate: 1 });
scheduledPaymentSchema.index({ isPaid: 1 });

module.exports = mongoose.model('ScheduledPayment', scheduledPaymentSchema);
