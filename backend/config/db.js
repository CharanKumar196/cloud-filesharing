require('dotenv').config();  // THIS LINE MUST BE FIRST
   
   const mongoose = require('mongoose');
   
   const connectDB = async () => {
     try {
       console.log('URI:', process.env.MONGO_URI); // Debug line
       await mongoose.connect(process.env.MONGO_URI);
       console.log('MongoDB connected!');
     } catch (error) {
       console.error('Connection error:', error);
       process.exit(1);
     }
   };
   
   module.exports = connectDB;