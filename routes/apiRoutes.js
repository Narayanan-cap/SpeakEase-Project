const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Path to store data files (users, feedback, maintenance, etc.)
const dataDir = path.join(__dirname, '../data');
const usersFile = path.join(dataDir, 'users.json');

//mongoose
const mongoose = require('mongoose');
require('../db'); // connects to DB
const User = require('../models/User');

// USER REGISTRATION ROUTE
router.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const newUser = new User({ username, password }); // NOTE: Hashing recommended
    await newUser.save();

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// USER LOGIN ROUTE
router.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password }); // Match both for now (hashing later)

    if (user) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// FEEDBACK SUBMISSION ROUTE
router.post('/api/feedback', (req, res) => {
  const feedback = req.body;  // Feedback submitted from client
  const filePath = path.join(dataDir, 'feedback.json');

  // Read existing feedbacks (if any)
  let feedbacks = [];
  if (fs.existsSync(filePath)) {
    feedbacks = JSON.parse(fs.readFileSync(filePath));
  }

  // Add new feedback and save
  feedbacks.push(feedback);
  fs.writeFileSync(filePath, JSON.stringify(feedbacks, null, 2));

  res.status(200).json({ message: 'Feedback submitted successfully' });
});


// The maintenance route has been moved to routes/maintenance.js 
// to use MongoDB instead of file system storage

// Export router to be used in main server.js/app.js
module.exports = router;