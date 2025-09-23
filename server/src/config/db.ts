import mongoose from 'mongoose';

const uri =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/my-typescript-project';
let isConnected = false;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (isConnected) return mongoose;
  try {
    const conn = await mongoose.connect(uri);
    isConnected = conn.connection.readyState === 1;
    console.log(`🚀 Connected to MongoDB via Mongoose: ${uri}`);
    return mongoose;
  } catch (error) {
    console.error('Mongoose connection error:', error);
    throw error;
  }
}
