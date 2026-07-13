const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  photo: { type: String, default: 'https://placehold.co/300x300/e5e7eb/9ca3af?text=No+Image' },
  category: { type: String },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);