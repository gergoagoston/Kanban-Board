import mongoose from 'mongoose';

import { mongoDatabaseName, mongoUrl, mongooseUrl } from './config';

console.log(`Connecting to Mongo at ${mongooseUrl}, database ${mongoDatabaseName} ...`);

export async function getMongoDb() {
  try {
    await mongoose.connect(mongooseUrl);
    
    console.log('MongoDB connection successful');
  } catch (error) {
    console.error('MongoDB connection failed:');
    throw error;
  }
}
