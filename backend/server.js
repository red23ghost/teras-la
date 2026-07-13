const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL
  ].filter(Boolean)
}));
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tenants', require('./routes/tenantRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/tables', require('./routes/tableRoutes'));

app.get('/', (req, res) => {
  res.send('<h1>Backend Teras LA berjalan!</h1>');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server Teras LA berjalan di http://localhost:${PORT}`);
});