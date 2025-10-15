const mongoose = require('mongoose');

// Load environment variables
const authUri = process.env.MONGODB_AUTH_URI;
const feedbackUri = process.env.MONGODB_FEEDBACK_URI;

// Connection options (timeouts etc.)
const connectionOptions = {
  serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT) || 5000,
  connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT) || 10000,
  socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
  bufferCommands: false
};

// Debug log to confirm URIs
console.log("🔗 Connecting to MongoDB...");
console.log("  Auth DB URI:", authUri);
console.log("  Feedback DB URI:", feedbackUri);

// Create two separate connections
const authConnection = mongoose.createConnection(authUri, connectionOptions);
const feedbackConnection = mongoose.createConnection(feedbackUri, connectionOptions);

// Feedback DB listeners
feedbackConnection.on('connected', () => {
  console.log('✅ Connected to feedbackDB');
});
feedbackConnection.on('error', (err) => {
  console.error('❌ feedbackDB connection error:', err.message);
});
feedbackConnection.on('disconnected', () => {
  console.log('⚠️  feedbackDB disconnected');
});

// Auth DB listeners
authConnection.on('connected', () => {
  console.log('✅ Connected to authdb');
});
authConnection.on('error', (err) => {
  console.error('❌ authdb connection error:', err.message);
});

module.exports = {
  authConnection,
  feedbackConnection
};
