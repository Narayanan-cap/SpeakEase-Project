const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Maintenance = require('../models/Maintenance');

// GET /api/status - Combined view of all feedback and maintenance records
router.get('/status', async (req, res) => {
  try {
    console.log('Fetching all records for status page...');
    
    // Fetch feedback records
    const feedbackRecords = await Feedback.find({}).sort({ createdAt: -1 });
    
    // Fetch maintenance records
    const maintenanceRecords = await Maintenance.find({}).sort({ createdAt: -1 });
    
    // Transform feedback records to standard format
    const transformedFeedback = feedbackRecords.map(record => ({
      feedbackId: record.feedbackId,
      category: record.category,
      summary: record.description, // Map description to summary
      status: record.status || 'Pending', // Default status if not set
      type: 'Feedback',
      createdAt: record.createdAt
    }));
    
    // Transform maintenance records to standard format
    const transformedMaintenance = maintenanceRecords.map(record => ({
      feedbackId: record.feedbackId,
      category: record.category,
      summary: record.summary,
      status: record.status || 'Pending',
      type: 'Maintenance',
      createdAt: record.createdAt
    }));
    
    // Combine both arrays and sort by creation date (newest first)
    const allRecords = [...transformedFeedback, ...transformedMaintenance]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    console.log(`Found ${transformedFeedback.length} feedback records and ${transformedMaintenance.length} maintenance records`);
    
    res.json({
      success: true,
      totalCount: allRecords.length,
      feedbackCount: transformedFeedback.length,
      maintenanceCount: transformedMaintenance.length,
      data: allRecords
    });
    
  } catch (error) {
    console.error('Error fetching status data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;
