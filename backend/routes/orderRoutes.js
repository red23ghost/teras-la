const express = require('express');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all orders (admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().populate('table').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get orders by tenant
router.get('/tenant/:tenantId', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ 'items.tenant': req.params.tenantId })
      .populate('table')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('table');
    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create order (customer)
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update order status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update payment status
router.put('/:id/payment', async (req, res) => {
  try {
    const { paymentMethod, paymentStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentMethod, paymentStatus },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;