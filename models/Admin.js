const mongoose = require('mongoose');
const { authConnection } = require('../db');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = authConnection.model('Admin', adminSchema);
