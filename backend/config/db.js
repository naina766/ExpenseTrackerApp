const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI && process.env.MONGO_URI.trim();

  if (!uri) {
    console.error('MongoDB connection error: MONGO_URI is not defined in .env');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('⚠️  Server will continue running, but DB operations will fail.');
    // Don't exit — let the server stay alive so we can see the Expo QR code
  }
};

module.exports = connectDB;
