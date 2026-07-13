const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableCode: { type: String, required: true, unique: true },
  tableNumber: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);