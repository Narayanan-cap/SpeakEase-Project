// models/Maintenance.js
const mongoose = require('mongoose');
const { feedbackConnection } = require('../db');

const maintenanceSchema = new mongoose.Schema({
  feedbackId: { type: String, unique: true }, // Custom feedback ID like FDB2001
  category: { type: String, required: true },
  summary: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  date: { type: String },
  location: String,
  time: String,
  staff: String,
  name: String,
  contact: String,
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'maintenances' // Explicit collection name
});

// Function to generate the next feedback ID
async function generateFeedbackId() {
  try {
    // Find the latest feedback ID
    const lastRecord = await feedbackConnection.model("Maintenance", maintenanceSchema)
      .findOne({ feedbackId: { $regex: /^FDB\d+$/ } })
      .sort({ feedbackId: -1 })
      .select('feedbackId');
    
    if (lastRecord && lastRecord.feedbackId) {
      // Extract number from last ID (e.g., "FDB2001" -> "2001")
      const lastNumber = parseInt(lastRecord.feedbackId.replace('FDB', ''));
      const nextNumber = lastNumber + 1;
      return `FDB${nextNumber.toString().padStart(4, '0')}`; // FDB2002, FDB2003, etc.
    } else {
      // First record
      return 'FDB2001';
    }
  } catch (error) {
    console.error('Error generating feedback ID:', error);
    // Fallback to timestamp-based ID if there's an error
    const timestamp = Date.now().toString().slice(-4);
    return `FDB${timestamp}`;
  }
}

// Pre-save middleware to generate feedbackId
maintenanceSchema.pre('save', async function(next) {
  if (this.isNew && !this.feedbackId) {
    try {
      this.feedbackId = await generateFeedbackId();
    } catch (error) {
      console.error('Error in pre-save middleware:', error);
      // Fallback ID generation
      const timestamp = Date.now().toString().slice(-4);
      this.feedbackId = `FDB${timestamp}`;
    }
  }
  next();
});

// Disable buffering to prevent timeout issues
maintenanceSchema.set('bufferCommands', false);

// Use feedbackConnection instead of default mongoose connection
module.exports = feedbackConnection.model("Maintenance", maintenanceSchema);
