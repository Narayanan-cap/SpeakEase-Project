const express = require("express");
const router = express.Router();
const User = require("../models/User");

// POST /api/register
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, phone, username, password } = req.body;

console.log('Received form data:', req.body);   //temp


    // Check if user already exists
    const existing = await User.findOne({ username });
    if (existing) {
      return res.json({ success: false, message: "Username already exists" });
    }

    const newUser = new User({
      fullName,
      email,
      phone: String(phone),
      username,
      password, // 🔐 You should hash this before saving in production!
    });

    await newUser.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
