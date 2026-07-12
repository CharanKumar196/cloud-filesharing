// ============================================
// CLOUD FILE SHARING - BACKEND SERVER
// ============================================

// Import required packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');

// Load environment variables from .env file
// This file contains: MONGODB_URI, PORT, AWS credentials, etc
dotenv.config();

// Create Express application
// Express is a framework that helps manage HTTP requests/responses
const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION
// Middleware processes requests before they reach routes
// ============================================

// Enable CORS (Cross-Origin Resource Sharing)
// Allows frontend (localhost:3000) to communicate with backend (localhost:5000)
app.use(cors());

// Parse incoming JSON requests
// Converts JSON data to JavaScript objects
app.use(express.json());

// Parse URL-encoded form data
// Handles form submissions from frontend
app.use(express.urlencoded({ extended: true }));

// Enable file upload handling
// Allows frontend to send files to backend
app.use(fileUpload());

// ============================================
// DATABASE CONNECTION
// Connect to MongoDB Atlas
// ============================================

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    // Connection successful
    console.log('✅ MongoDB connected successfully');
  })
  .catch(err => {
    // Connection failed
    console.log('❌ MongoDB connection error:', err);
  });

// ============================================
// ROUTE DEFINITIONS
// Map API endpoints to controllers
// ============================================

// Authentication routes
// Handles: /api/auth/login, /api/auth/register, /api/auth/getMe
app.use('/api/auth', require('./routes/auth'));

// File routes
// Handles: /api/files/upload, /api/files/:id, /api/files/search/:query
app.use('/api/files', require('./routes/file'));

// Folder routes
// Handles: /api/folders/create, /api/folders/:id, etc
app.use('/api/folders', require('./routes/folders'));

// ============================================
// TEST ROUTE
// ============================================
// TEST ROUTE
// Simple route to verify server is running
// ============================================

app.get('/', (req, res) => {
  // When user visits http://localhost:5000
  // Server responds with this message
  res.json({ 
    message: 'Cloud File Sharing API running',
    status: 'Server is online ✅'
  });
});

const feedbackRoutes = require('./routes/feedback');
app.use('/api/feedback', feedbackRoutes);

// ============================================
// ERROR HANDLING MIDDLEWARE
// Catches errors from routes and sends response
// ============================================

app.use((err, req, res, next) => {
  // Log error to console for debugging
  console.error('❌ Server Error:', err.stack);
  
  // Send error response to frontend
  // Frontend can then show error message to user
  res.status(500).json({ 
    success: false, 
    message: 'Server error occurred',
    error: err.message
  });
});

// ============================================
// START SERVER
// Listen on specified port
// ============================================

// Get PORT from .env file, or use 5000 as default
const PORT = process.env.PORT || 5000;

// Start server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`
  ========================================
  🚀 Server Started Successfully!
  ========================================
  ✅ Backend running on: http://localhost:${PORT}
  ✅ Frontend running on: http://localhost:3000
  ✅ Database: MongoDB Atlas connected
  ========================================
  `);
});

// ============================================
// FLOW EXPLANATION
// ============================================

/*
When a request comes in, it follows this flow:

1. Frontend sends request
   Example: POST http://localhost:5000/api/auth/login
   
2. CORS middleware checks if request is allowed ✅
   
3. JSON middleware parses the request body
   
4. File upload middleware checks for files (if any)
   
5. Express router matches the URL pattern
   /api/auth → goes to routes/auth.js
   
6. Route handler calls the appropriate controller
   Example: authController.login()
   
7. Controller processes the request
   - Validates input
   - Queries database
   - Returns response
   
8. Response sent back to frontend
   Example: { success: true, token: "..." }
   
9. If error occurs anywhere, ERROR HANDLING middleware catches it
   and sends error response to frontend
*/

// ============================================
// EXAMPLE REQUEST FLOW
// ============================================

/*
User clicks "Login" button in frontend

1. Frontend sends:
   POST /api/auth/login
   { email: "user@example.com", password: "123456" }

2. Server receives request → CORS checks ✅

3. JSON middleware parses request body ✅

4. Express router matches /api/auth → auth.js

5. auth.js routes to authController.login()

6. Controller:
   - Finds user in MongoDB
   - Checks password
   - Creates JWT token
   - Returns: { success: true, token: "..." }

7. Frontend receives response → logs user in ✅

OR if error:

6. Controller finds error → throws exception

7. ERROR HANDLING middleware catches it

8. Sends error response: { success: false, message: "Invalid email" }

9. Frontend receives error → shows error message to user
*/