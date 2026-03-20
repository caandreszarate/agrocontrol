require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// Conexión DB
connectDB();

// CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5500',
    'http://localhost:3001',
    'http://127.0.0.1:5500',
    'http://127.0.0.1:5501',
    'null' // file:// protocol para desarrollo local
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting general
app.use('/api/', generalLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AgroControl API funcionando', timestamp: new Date() });
});

// Diagnóstico temporal — remover después
app.get('/api/debug', async (req, res) => {
  const mongoose = require('mongoose');
  const User = require('./models/User');
  try {
    const dbState = mongoose.connection.readyState;
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    const userCount = await User.countDocuments();
    const users = await User.find().select('email role isActive');
    res.json({
      dbState: states[dbState],
      dbName: mongoose.connection.name,
      userCount,
      users
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/phases', require('./routes/phases'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/production', require('./routes/production'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/dashboard', require('./routes/dashboard'));

// 404
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Ruta ${req.originalUrl} no encontrada` });
});

// Error handler global
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AgroControl API corriendo en puerto ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = app;
