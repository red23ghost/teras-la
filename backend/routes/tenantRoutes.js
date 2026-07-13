const express = require('express');
const bcrypt = require('bcryptjs');
const Tenant = require('../models/Tenant');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const router = express.Router();

// Get all tenants (public)
router.get('/', async (req, res) => {
  try {
    const tenants = await Tenant.find({ isActive: true }).select('-password');
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get one tenant
router.get('/:id', async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id).select('-password');
    if (!tenant) return res.status(404).json({ message: 'Tenant tidak ditemukan' });
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create tenant (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, phone, username, password, description } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const tenant = new Tenant({ name, phone, username, password: hashedPassword, description });
    await tenant.save();
    res.status(201).json({ message: 'Tenant berhasil dibuat', tenant });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upload logo tenant
router.post('/:id/upload-logo', authMiddleware, upload.single('logo'), async (req, res) => {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'teras-la/tenants' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, { logo: result.secure_url }, { new: true });
    res.json({ logo: result.secure_url, tenant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete tenant (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Tenant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tenant berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;