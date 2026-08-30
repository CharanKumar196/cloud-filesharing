// ============================================
// CLOUD FILE SHARING - BACKEND SERVER
// ============================================

// Import required packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');

// Load environment variables from .env file
// This file contains: PORT, SUPABASE_URL, SUPABASE_KEY, AWS credentials, etc.
dotenv.config();
// Start the daily trash auto-purge job (deletes items in Trash older than 15 days)
require('./jobs/purgeTrash');

// Create Express application
const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Enable file upload handling
app.use(fileUpload());

// ============================================
// ROUTE DEFINITIONS
// Map API endpoints to controllers
// ============================================

// Authentication routes
app.use('/api/auth', require('./routes/auth'));

// File routes
app.use('/api/files', require('./routes/file'));

// Folder routes
app.use('/api/folders', require('./routes/folders'));

// Feedback routes
app.use('/api/feedback', require('./routes/feedback'));

// Trash routes
app.use('/api/trash', require('./routes/trash'));

// ============================================
// TEST ROUTE
// ============================================

app.get('/', (req, res) => {
  res.json({ 
    message: 'Cloud File Sharing API running',
    status: 'Server is online ✅'
  });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  
  res.status(500).json({ 
    success: false, 
    message: 'Server error occurred',
    error: err.message
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ========================================
  🚀 Server Started Successfully!
  ========================================
  ✅ Backend running on: http://localhost:${PORT}
  ✅ Frontend running on: http://localhost:3000
  ✅ Database: Supabase PostgreSQL connected
  ========================================
  `);
});