const express = require("express");
const router = express.Router();
const User = require("../models/User"); // MongoDB model

// Login Route
router.post("/api/login", async (req, res) => {
  console.log("Request body:", req.body); // ✅ Log incoming data
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });

    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    return res.json({ success: true, user }); // Success response
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
