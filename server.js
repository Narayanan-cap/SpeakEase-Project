require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const db = require("./db");
const app = express();



app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

const PORT = process.env.PORT || 3000;

const authRoutes = require("./routes/auth");
app.use('/', authRoutes);


app.use(express.json());
app.use(express.static("public")); // for serving HTML/CSS/JS

const registerRoutes = require("./routes/register");
app.use("/api", registerRoutes);

const feedbackRoutes = require("./routes/feedback");
app.use("/api", feedbackRoutes);

const maintenanceRoutes = require("./routes/maintenance");
app.use("/api/maintenance", maintenanceRoutes);

const statusRoutes = require("./routes/status");
app.use("/api", statusRoutes);

const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

const otpRoutes = require("./routes/otp");
app.use("/api", otpRoutes);

// Routes
const pageRoutes = require('./routes/pageRoutes');
const apiRoutes = require('./routes/apiRoutes');

app.use('/', pageRoutes);
app.use('/', apiRoutes);

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Start server
app.listen(PORT,"0.0.0.0", () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const tracer = require('dd-trace').init({
  logInjection: true
});

