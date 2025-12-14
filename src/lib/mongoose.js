import mongoose from 'mongoose';
import config from '../config/index.js';
import { logger } from './winston.js';

// Mongoose connection options
const clientOptions = {
  dbName: 'blog-db',
  appName: 'Blog API',
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
};

export const connectToDatabase = async () => {
  if (!config.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }
  try {
    await mongoose.connect(config.MONGO_URI, clientOptions);
    logger.info(`Connected to MongoDB successfully.`, {
      uri: config.MONGO_URI,
      options: clientOptions,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    logger.error('Error connecting to MongoDB:', error);
  }
};

export const disconnectFromDatabase = async () => {
  try {
    // Force close all sockets immediately
    mongoose.connections.forEach((conn) => {
      conn.client?.close(true);
    });

    logger.info('Disconnected from MongoDB successfully.', {
      uri: config.MONGO_URI,
      options: clientOptions,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    logger.error('Error disconnecting from MongoDB:', error);
  }
};
