const mongoose = require('mongoose');
const { authConnection } = require('../db');



const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  username: { type: String, unique: true },
  password: String,
});

module.exports = authConnection.model("User", userSchema);