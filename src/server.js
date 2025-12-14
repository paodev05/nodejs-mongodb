import express from 'express';
import config from './config/index.js';
import limiter from './lib/express_rate_limit.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import v1Routes from './routes/v1/index.js';
import { connectToDatabase, disconnectFromDatabase } from './lib/mongoose.js';
import { logger } from './lib/winston.js';

const app = express();

const corsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV === 'development' ||
      !origin ||
      config.WHITELIST_ORIGINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error(`CORS Error: ${origin} not allowed by CORS`), false);
      logger.warn(`CORS Error: ${origin} not allowed by CORS`);
    }
  },
};

app.use(cors(corsOptions)); // Enable CORS with the specified options
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser()); // for parsing cookies
app.use(helmet()); // for setting various HTTP headers for app security
app.use(compression({ threshold: 1024 })); // compress responses over 1KB
app.use(limiter); // Apply rate limiting to all requests

(async () => {
  // Any asynchronous initialization can go here
  try {
    await connectToDatabase();
    app.use('/api/v1', v1Routes); // Mount v1 routes at /api/v1

    app.listen(config.PORT, () => {
      logger.info(`Server is running on port: ${config.PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start the server', error);

    // Exit the process with failure
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
})();

const handleServerShutdown = async () => {
  try {
    await disconnectFromDatabase();
    logger.warn('SERVER SHUTDOWN');
    process.exit(0); // Exit the process with success
  } catch (error) {
    logger.error('Error during server shutdown', error);
  }
};

process.on('SIGTERM', handleServerShutdown);
process.on('SIGINT', handleServerShutdown);
