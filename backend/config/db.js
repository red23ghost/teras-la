const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Teras LA terhubung!');
  } catch (error) {
    console.error('Gagal konek MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;