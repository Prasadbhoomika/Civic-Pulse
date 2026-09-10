const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    system: 'CivicPulse Smart City Core API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/ready', (req, res) => {
  const dbState = require('mongoose').connection.readyState;
  const ready = dbState === 1;
  res.status(ready ? 200 : 503).json({
    status: ready ? 'READY' : 'NOT_READY',
    database: ready ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
 ╔════════════════════════════════════════════════════════════╗
 ║  ◈ CIVICPULSE // SMART CITY COMMAND CENTER CORE RUNNING    ║
 ║  --------------------------------------------------------  ║
 ║  PORT: ${PORT}                                                ║
 ║  ENV:  ${process.env.NODE_ENV || 'development'}                                         ║
 ║  API:  http://localhost:${PORT}/api/health                      ║
 ╚════════════════════════════════════════════════════════════╝
  `);
});
