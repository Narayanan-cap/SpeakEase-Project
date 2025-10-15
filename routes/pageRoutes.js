
//  Import the required modules
const express = require('express');
const path = require('path');
const router = express.Router(); // Create a new router instance

//  Define the base path where all HTML views are located
const viewsPath = path.join(__dirname, "../public/views");

//  Route: Redirect root URL to /home
router.get('/', (req, res) => {
  res.redirect('/home'); // When accessing "/", redirect to /home
});

//  Route: Home Page
router.get('/home', (req, res) => {
  res.sendFile(path.join(viewsPath, 'home.html'));
});

//  Route: Login Page
router.get("/loginpage", (req, res) => {
  res.sendFile(path.join(__dirname, '../public/views', 'loginpage.html'));
});

//  Route: Registration Page
router.get("/registration", (req, res) => {
  res.sendFile(path.join(__dirname, '../public/views', 'registration.html'));
});

//  Route: Forgot Password Page
router.get("/forgot", (req, res) => {
  res.sendFile(path.join(__dirname, '../public/views', 'forgot.html'));
});

//  Route: Maintenance Page
router.get("/maintenance", (req, res) => {
  res.sendFile(path.join(__dirname, '../public/views', 'maintenance.html'));
});

// Route: status Page (e.g., to check complaint or feedback status)
router.get("/status", (req, res) => {
  res.sendFile(path.join(__dirname, '../public/views', 'status.html'));
});

//  Route: Admin Panel Page
router.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, '../public/views', 'admin.html'));
});

//  Route: Confirmation Page (e.g., after successful submission)
router.get("/confirmation", (req, res) => {
  res.sendFile(path.join(__dirname, '../public/views', 'confirmation.html'));
});

// Route: My Page (custom user page or dashboard)
router.get("/my", (req, res) => {
  res.sendFile(path.join(__dirname, '../public/views', 'my.html'));
});

//  Route: Index Page (can be a landing or alternate home page)
router.get("/index", (req, res) => {
  res.sendFile(path.join(__dirname, '../public/views', 'index.html'));
});

// Export the router to be used in main app.js/server.js
module.exports = router;
