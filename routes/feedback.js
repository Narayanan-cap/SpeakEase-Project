const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

router.post('/feedback', async (req, res) => {
  try {
    console.log('Received Feedback Data:', req.body);
    
    const { type, category, description, name, mobile, email, address } = req.body;
    const newFeedback = new Feedback({ type, category, description, name, mobile, email, address });
    const savedFeedback = await newFeedback.save();
    
    console.log('Generated Feedback ID:', savedFeedback.feedbackId);
    
    res.json({ 
      success: true, 
      id: savedFeedback._id,
      feedbackId: savedFeedback.feedbackId,
      complaintId: savedFeedback.feedbackId // For backward compatibility
    });
  } catch (err) {
    console.error('Error saving feedback:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/feedback - View all feedback records
router.get('/feedback', async (req, res) => {
  try {
    const records = await Feedback.find({}).sort({ createdAt: -1 });
    res.json({ 
      success: true, 
      count: records.length, 
      data: records 
    });
  } catch (error) {
    console.error('Error fetching feedback records:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
