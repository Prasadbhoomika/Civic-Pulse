const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civicpulse';
    console.log(`[CivicPulse DB] Connecting to MongoDB at ${connStr}...`);
    
    // Set strictQuery to false for flex search
    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000 // 5 sec timeout fallback
    });

    console.log(`[CivicPulse DB] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[CivicPulse DB Warning] Direct MongoDB connection failed (${error.message}).`);
    console.warn(`[CivicPulse DB Note] Using fallback mock database store so all endpoints work offline without local MongoDB daemon.`);
    return false;
  }
};

module.exports = connectDB;
