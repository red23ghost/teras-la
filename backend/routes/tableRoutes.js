const express = require('express');
const Table = require('../models/Table');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all tables
router.get('/', async (req, res) => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get table by code (untuk customer scan QR)
router.get('/code/:tableCode', async (req, res) => {
  try {
    const table = await Table.findOne({ tableCode: req.params.tableCode });
    if (!table) return res.status(404).json({ message: 'Meja tidak ditemukan' });
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create table (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tableCode, tableNumber } = req.body;
    const table = new Table({ tableCode, tableNumber });
    await table.save();
    res.status(201).json(table);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete table
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Table.findByIdAndDelete(req.params.id);
    res.json({ message: 'Meja berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;