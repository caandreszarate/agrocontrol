require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Phase = require('../models/Phase');
const Expense = require('../models/Expense');
const ScheduledPayment = require('../models/ScheduledPayment');
const CalendarEvent = require('../models/CalendarEvent');

const PHASES_DATA = [
  { name: 'Alquiler del terreno', order: 1 },
  { name: 'Alistamiento del terreno', order: 2 },
  { name: 'Preabono', order: 3 },
  { name: 'Siembra', order: 4 },
  { name: 'Sellado', order: 5 },
  { name: 'Limpieza de maleza', order: 6 },
  { name: 'Aplicación de abono', order: 7 }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB conectado para seed');

    // Limpiar colecciones
    await Promise.all([
      User.deleteMany({}),
      Phase.deleteMany({}),
      Expense.deleteMany({}),
      ScheduledPayment.deleteMany({}),
      CalendarEvent.deleteMany({})
    ]);
    console.log('Colecciones limpiadas');

    // Crear usuario admin
    const adminUser = await User.create({
      name: 'Administrador',
      email: 'admin@agrocontrol.com',
      password: 'Admin2024!',
      role: 'admin',
      isActive: true
    });
    console.log(`Admin creado: ${adminUser.email}`);

    // Crear viewer
    await User.create({
      name: 'Trabajador Demo',
      email: 'viewer@agrocontrol.com',
      password: 'Viewer2024!',
      role: 'viewer',
      isActive: true
    });
    console.log('Viewer creado');

    // Crear fases
    const phases = await Phase.insertMany(PHASES_DATA);
    console.log(`${phases.length} fases creadas`);

    // Gastos demo
    const expensesData = [
      {
        date: new Date('2024-01-15'),
        amount: 800000,
        description: 'Primer pago arriendo terreno 2 hectáreas',
        category: 'otros',
        phase: phases[0]._id,
        createdBy: adminUser._id
      },
      {
        date: new Date('2024-02-01'),
        amount: 350000,
        description: 'Alquiler motocultor para alistamiento',
        category: 'maquinaria',
        phase: phases[1]._id,
        createdBy: adminUser._id
      },
      {
        date: new Date('2024-02-10'),
        amount: 450000,
        description: 'Jornales alistamiento del terreno (3 personas × 2 días)',
        category: 'trabajadores',
        phase: phases[1]._id,
        createdBy: adminUser._id
      },
      {
        date: new Date('2024-03-01'),
        amount: 620000,
        description: 'Cal dolomítica y fertilizante preabono',
        category: 'insumos',
        phase: phases[2]._id,
        createdBy: adminUser._id
      },
      {
        date: new Date('2024-03-15'),
        amount: 300000,
        description: 'Jornales aplicación preabono',
        category: 'trabajadores',
        phase: phases[2]._id,
        createdBy: adminUser._id
      },
      {
        date: new Date('2024-04-01'),
        amount: 1200000,
        description: 'Colinos de plátano hartón (400 unidades × $3.000)',
        category: 'insumos',
        phase: phases[3]._id,
        createdBy: adminUser._id
      },
      {
        date: new Date('2024-04-10'),
        amount: 600000,
        description: 'Jornales siembra (4 personas × 3 días)',
        category: 'trabajadores',
        phase: phases[3]._id,
        createdBy: adminUser._id
      }
    ];

    const expenses = await Expense.insertMany(expensesData);
    console.log(`${expenses.length} gastos demo creados`);

    // Pagos programados demo
    const today = new Date();
    await ScheduledPayment.insertMany([
      {
        description: 'Arriendo terreno - Mes 2',
        amount: 800000,
        dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        category: 'arriendo',
        isPaid: false,
        createdBy: adminUser._id
      },
      {
        description: 'Jornales limpieza maleza',
        amount: 450000,
        dueDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000),
        category: 'trabajadores',
        isPaid: false,
        createdBy: adminUser._id
      },
      {
        description: 'Fertilizante Urea 25kg',
        amount: 180000,
        dueDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        category: 'insumos',
        isPaid: false,
        notes: 'Vencido — pagar urgente',
        createdBy: adminUser._id
      }
    ]);
    console.log('Pagos programados demo creados');

    // Actualizar fases con progreso demo
    await Phase.findByIdAndUpdate(phases[0]._id, {
      status: 'completed',
      progressPercent: 100,
      startDate: new Date('2024-01-10'),
      endDate: new Date('2024-01-20')
    });
    await Phase.findByIdAndUpdate(phases[1]._id, {
      status: 'completed',
      progressPercent: 100,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-15')
    });
    await Phase.findByIdAndUpdate(phases[2]._id, {
      status: 'completed',
      progressPercent: 100,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-20')
    });
    await Phase.findByIdAndUpdate(phases[3]._id, {
      status: 'completed',
      progressPercent: 100,
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-04-15')
    });
    await Phase.findByIdAndUpdate(phases[4]._id, {
      status: 'in_progress',
      progressPercent: 60,
      startDate: new Date('2024-05-01')
    });
    console.log('Fases actualizadas con progreso');

    console.log('\n✅ Seed completado exitosamente');
    console.log('─────────────────────────────────────');
    console.log('Admin:  admin@agrocontrol.com / Admin2024!');
    console.log('Viewer: viewer@agrocontrol.com / Viewer2024!');
    console.log('─────────────────────────────────────');

  } catch (error) {
    console.error('Error en seed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
