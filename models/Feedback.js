const mongoose = require('mongoose');
const { feedbackConnection } = require('../db');

const feedbackSchema = new mongoose.Schema({
  feedbackId: { type: String, unique: true }, // Custom feedback ID like FDB3001
  type: String,
  category: String,
  description: String,
  name: String,
  mobile: String,
  email: String,
  address: String,
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

// Function to generate the next feedback ID
async function generateFeedbackId() {
  try {
    // Find the latest feedback ID with FDB3xxx format
    const lastRecord = await feedbackConnection.model("Feedback", feedbackSchema)
      .findOne({ feedbackId: { $regex: /^FDB3\d+$/ } })
      .sort({ feedbackId: -1 })
      .select('feedbackId');
    
    if (lastRecord && lastRecord.feedbackId) {
      // Extract number from last ID (e.g., "FDB3001" -> "3001")
      const lastNumber = parseInt(lastRecord.feedbackId.replace('FDB3', ''));
      const nextNumber = lastNumber + 1;
      return `FDB3${nextNumber.toString().padStart(3, '0')}`; // FDB3002, FDB3003, etc.
    } else {
      // First record
      return 'FDB3001';
    }
  } catch (error) {
    console.error('Error generating feedback ID:', error);
    // Fallback to timestamp-based ID if there's an error
    const timestamp = Date.now().toString().slice(-3);
    return `FDB3${timestamp}`;
  }
}

// Pre-save middleware to generate feedbackId
feedbackSchema.pre('save', async function(next) {
  if (this.isNew && !this.feedbackId) {
    try {
      this.feedbackId = await generateFeedbackId();
    } catch (error) {
      console.error('Error in pre-save middleware:', error);
      // Fallback ID generation
      const timestamp = Date.now().toString().slice(-3);
      this.feedbackId = `FDB3${timestamp}`;
    }
  }
  next();
});

// Disable buffering to prevent timeout issues
feedbackSchema.set('bufferCommands', false);

module.exports = feedbackConnection.model('Feedback', feedbackSchema);
