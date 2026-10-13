import mongoose from 'mongoose';
import { seedDefaults } from '../services/store';

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/distributed_chat_db';
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully to ${mongoURI}`);
    await seedDefaults();
  } catch (err: any) {
    console.warn(`[MongoDB] Connection warning: ${err.message}. Running in fallback state...`);
  }
};
