// Initialize Admin User Script
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function initializeAdmin() {
  try {
    console.log('Connecting to database...');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin123' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists in database');
      console.log('Username: admin123');
      console.log('Password: Admin@123');
    } else {
      // Create new admin user
      const newAdmin = new Admin({
        username: 'admin123',
        password: 'Admin@123'
      });
      
      await newAdmin.save();
      console.log('✅ Admin user created successfully!');
      console.log('Username: admin123');
      console.log('Password: Admin@123');
    }
    
    console.log('\n🎉 You can now access the admin panel at: http://localhost:3000/admin');
    
  } catch (error) {
    console.error('❌ Error initializing admin user:', error);
  } finally {
    // Don't close connections as they might be managed by the main app
    console.log('\n✨ Admin initialization completed');
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  initializeAdmin();
}

module.exports = initializeAdmin;
