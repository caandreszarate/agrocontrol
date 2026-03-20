const mongoose = require('mongoose');

const phaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la fase es requerido'],
    trim: true
  },
  order: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  progressPercent: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notas máximo 1000 caracteres'],
    default: ''
  },
  imageUrls: {
    type: [String],
    default: []
  }
}, { timestamps: true });

phaseSchema.index({ order: 1 });

module.exports = mongoose.model('Phase', phaseSchema);
