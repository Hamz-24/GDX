import 'dotenv/config';
import mongoose from 'mongoose';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

async function testConnection() {
  console.log('Testing MONGO_URI with Google DNS (8.8.8.8):', process.env.MONGO_URI);
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('🎉 SUCCESS! Connected directly to MongoDB Atlas!');
    
    // Seed initial collections
    console.log('Database name:', mongoose.connection.name);
    console.log('Collections available:', Object.keys(mongoose.connection.collections));

    process.exit(0);
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  }
}

testConnection();
