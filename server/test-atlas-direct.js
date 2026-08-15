import mongoose from 'mongoose';
import dns from 'dns';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dns.setDefaultResultOrder('ipv4first');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_) {}

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '.env') });

async function testAtlasConnection() {
  console.log('Testing Atlas Connection with Google DNS (8.8.8.8)...');
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('🎉 SUCCESS! Connected directly to MongoDB Atlas Cloud Database!');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in Atlas database:', collections.map(c => c.name));
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

testAtlasConnection();
