const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Tenant = require('../models/Tenant');
const router = express.Router();

// Login tenant
router.post('/tenant/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const tenant = await Tenant.findOne({ username });
    if (!tenant) return res.status(401).json({ message: 'Username atau password salah' });

    const isMatch = await bcrypt.compare(password, tenant.password);
    if (!isMatch) return res.status(401).json({ message: 'Username atau password salah' });

    const token = jwt.sign({ id: tenant._id, role: 'tenant' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, tenant: { id: tenant._id, name: tenant.name, username: tenant.username } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login admin
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
      const token = jwt.sign({ id: 'admin', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { username: 'admin', role: 'admin' } });
    } else {
      res.status(401).json({ message: 'Username atau password salah' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;