const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Tenant = require('./models/Tenant');

dotenv.config();

const NEW_PASSWORD = 'tenant123';

async function resetPasswords() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB terhubung!');

    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

    const result = await Tenant.updateMany(
      {},
      { $set: { password: hashedPassword } }
    );

    console.log(`Berhasil reset password untuk ${result.modifiedCount} tenant.`);
    console.log(`Password baru untuk semua tenant: ${NEW_PASSWORD}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetPasswords();