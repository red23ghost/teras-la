const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Tenant = require('./models/Tenant');
const Product = require('./models/Product');
const Table = require('./models/Table');

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB terhubung...');

    await Tenant.deleteMany({});
    await Product.deleteMany({});
    await Table.deleteMany({});

    // Buat tenant
    const hashedPassword = await bcrypt.hash('tenant123', 10);

    const tenants = await Tenant.insertMany([
      { name: 'Warung Nasi Bu Sari', phone: '08111111111', username: 'busari', password: hashedPassword, description: 'Nasi rumahan enak dan murah' },
      { name: 'Mie Ayam Pak Budi', phone: '08222222222', username: 'pakbudi', password: hashedPassword, description: 'Mie ayam spesial dengan kuah kaldu segar' },
      { name: 'Es Teh Manis Dimas', phone: '08333333333', username: 'dimas', password: hashedPassword, description: 'Minuman segar es teh dan jus buah' },
    ]);

    // Buat produk
    await Product.insertMany([
      { tenant: tenants[0]._id, name: 'Nasi Ayam Goreng', price: 15000, category: 'Makanan', description: 'Nasi putih dengan ayam goreng crispy' },
      { tenant: tenants[0]._id, name: 'Nasi Rendang', price: 18000, category: 'Makanan', description: 'Nasi putih dengan rendang sapi' },
      { tenant: tenants[0]._id, name: 'Nasi Telur Balado', price: 12000, category: 'Makanan', description: 'Nasi putih dengan telur balado pedas' },
      { tenant: tenants[1]._id, name: 'Mie Ayam Biasa', price: 13000, category: 'Makanan', description: 'Mie ayam dengan topping ayam cincang' },
      { tenant: tenants[1]._id, name: 'Mie Ayam Bakso', price: 16000, category: 'Makanan', description: 'Mie ayam dengan tambahan bakso' },
      { tenant: tenants[2]._id, name: 'Es Teh Manis', price: 5000, category: 'Minuman', description: 'Es teh manis segar' },
      { tenant: tenants[2]._id, name: 'Es Jeruk', price: 7000, category: 'Minuman', description: 'Es jeruk peras segar' },
      { tenant: tenants[2]._id, name: 'Jus Alpukat', price: 12000, category: 'Minuman', description: 'Jus alpukat creamy dengan susu' },
    ]);

    // Buat meja
    await Table.insertMany([
      { tableCode: 'MEJA-01', tableNumber: 1 },
      { tableCode: 'MEJA-02', tableNumber: 2 },
      { tableCode: 'MEJA-03', tableNumber: 3 },
      { tableCode: 'MEJA-04', tableNumber: 4 },
      { tableCode: 'MEJA-05', tableNumber: 5 },
    ]);

    console.log('Data berhasil ditambahkan!');
    console.log('Tenant username: busari, pakbudi, dimas');
    console.log('Password semua tenant: tenant123');
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedDB();