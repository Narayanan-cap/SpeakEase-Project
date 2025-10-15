// routes/maintenance.js
const express = require('express');
const router = express.Router();
const Maintenance = require('../models/Maintenance');

// POST /api/maintenance
router.post('/', async (req, res) => {
  try {
    const data = req.body;

    // Log received data for debugging
    console.log("Received Maintenance Data:", data);

    const newEntry = new Maintenance(data);
    const savedEntry = await newEntry.save();

    console.log("Generated Feedback ID:", savedEntry.feedbackId);
    
    res.json({ 
      success: true, 
      id: savedEntry._id,
      feedbackId: savedEntry.feedbackId // Return custom feedback ID
    });
  } catch (error) {
    console.error("Error saving maintenance:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/maintenance/view - View all maintenance records
router.get('/view', async (req, res) => {
  try {
    const records = await Maintenance.find({}).sort({ createdAt: -1 });
    res.json({ 
      success: true, 
      count: records.length, 
      data: records 
    });
  } catch (error) {
    console.error("Error fetching maintenance records:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
