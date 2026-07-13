const express = require('express');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const router = express.Router();

// Get all products (public) - bisa filter by tenant
router.get('/', async (req, res) => {
  try {
    const filter = { isAvailable: true };
    if (req.query.tenant) filter.tenant = req.query.tenant;
    const products = await Product.find(filter).populate('tenant', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get products by tenant
router.get('/tenant/:tenantId', async (req, res) => {
  try {
    const products = await Product.find({ tenant: req.params.tenantId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product (tenant only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const product = new Product({
      tenant: req.user.id,
      name, description, price, category
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upload foto produk
router.post('/:id/upload-photo', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'teras-la/products' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });
    const product = await Product.findByIdAndUpdate(req.params.id, { photo: result.secure_url }, { new: true });
    res.json({ photo: result.secure_url, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;