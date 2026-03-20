const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Fix: Railway puede decodificar '+' como espacio en la URI
    const rawUri = process.env.MONGODB_URI || '';
    const uri = rawUri.replace(/^mongodb\s/i, 'mongodb+').replace(/\s/g, '%20');

    console.log(`[DB] URI prefix: "${uri.substring(0, 20)}..."`);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
