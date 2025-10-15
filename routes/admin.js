const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Feedback = require('../models/Feedback');
const Maintenance = require('../models/Maintenance');

// Admin login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check for hardcoded admin credentials first
    if (username === 'admin123' && password === 'Admin@123') {
      return res.json({
        success: true,
        message: 'Admin login successful',
        admin: { username: 'admin123' }
      });
    }

    // Also check database for other admins
    const admin = await Admin.findOne({ username, password });
    if (admin) {
      res.json({
        success: true,
        message: 'Admin login successful',
        admin: { username: admin.username }
      });
    } else {
      res.json({
        success: false,
        message: 'Wrong password'
      });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all records for admin dashboard
router.get('/records', async (req, res) => {
  try {
    // Fetch feedback records
    const feedbackRecords = await Feedback.find({}).sort({ createdAt: -1 });
    
    // Fetch maintenance records  
    const maintenanceRecords = await Maintenance.find({}).sort({ createdAt: -1 });
    
    // Transform feedback records
    const transformedFeedback = feedbackRecords.map(record => ({
      id: record._id,
      feedbackId: record.feedbackId,
      category: record.category,
      summary: record.description,
      status: record.status,
      type: 'Feedback',
      createdAt: record.createdAt,
      name: record.name,
      email: record.email,
      mobile: record.mobile
    }));
    
    // Transform maintenance records
    const transformedMaintenance = maintenanceRecords.map(record => ({
      id: record._id,
      feedbackId: record.feedbackId,
      category: record.category,
      summary: record.summary,
      status: record.status,
      type: 'Maintenance',
      createdAt: record.createdAt,
      name: record.name,
      contact: record.contact
    }));
    
    // Combine and sort
    const allRecords = [...transformedFeedback, ...transformedMaintenance]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      data: allRecords,
      feedbackCount: transformedFeedback.length,
      maintenanceCount: transformedMaintenance.length,
      totalCount: allRecords.length
    });
    
  } catch (error) {
    console.error('Error fetching admin records:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update status of a record
router.put('/update-status', async (req, res) => {
  try {
    const { id, type, status } = req.body;
    
    if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    let updatedRecord;
    if (type === 'Feedback') {
      updatedRecord = await Feedback.findByIdAndUpdate(
        id, 
        { status }, 
        { new: true }
      );
    } else if (type === 'Maintenance') {
      updatedRecord = await Maintenance.findByIdAndUpdate(
        id, 
        { status }, 
        { new: true }
      );
    }
    
    if (updatedRecord) {
      res.json({
        success: true,
        message: 'status updated successfully',
        record: updatedRecord
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }
    
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Initialize admin user (run once)
router.post('/init-admin', async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne({ username: 'admin123' });
    if (!existingAdmin) {
      const newAdmin = new Admin({
        username: 'admin123',
        password: 'Admin@123'
      });
      await newAdmin.save();
      res.json({ success: true, message: 'Admin user created' });
    } else {
      res.json({ success: true, message: 'Admin user already exists' });
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
