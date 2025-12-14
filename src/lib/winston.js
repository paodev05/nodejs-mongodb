import winston from 'winston';
import config from '../config/index.js';

const { combine, timestamp, printf, colorize, json, errors, align } =
  winston.format;

const transports = [];

if (config.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }), // Add colors to log levels
        timestamp({ format: 'YYYY-MM-DD hh:mm:ss A' }), // Add timestamp in readable format
        align(), // Align the log messages
        printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? `\n${JSON.stringify(meta)}`
            : '';
          return `${timestamp} [${level}] : ${message}${metaStr}`;
        }),
      ),
    }),
  );
}

const logger = winston.createLogger({
  level: config.LOG_LEVEL || 'info',
  format: combine(timestamp(), errors({ stack: true }), json()), // Log in JSON format with timestamp and error stack
  transports,
  silent: config.NODE_ENV === 'test', // disable logging in test environment
});

export { logger };
