const mongoose = require('mongoose');

const productionRecordSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'La fecha es requerida'],
    default: Date.now
  },
  bunchesHarvested: {
    type: Number,
    required: [true, 'El número de racimos es requerido'],
    min: [0, 'No puede ser negativo']
  },
  weightKg: {
    type: Number,
    required: [true, 'El peso en kg es requerido'],
    min: [0, 'No puede ser negativo']
  },
  pricePerKg: {
    type: Number,
    required: [true, 'El precio por kg es requerido'],
    min: [0, 'No puede ser negativo']
  },
  totalRevenue: {
    type: Number,
    default: function () {
      return this.weightKg * this.pricePerKg;
    }
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

productionRecordSchema.pre('save', function (next) {
  this.totalRevenue = this.weightKg * this.pricePerKg;
  next();
});

productionRecordSchema.index({ date: -1 });

module.exports = mongoose.model('ProductionRecord', productionRecordSchema);
