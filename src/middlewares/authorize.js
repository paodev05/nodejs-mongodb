import { logger } from '../lib/winston.js';
import User from '../models/v1/user.js';

const authorize = (roles) => {
  return async (req, res, next) => {
    const userId = req.userId;

    try {
      const user = await User.findById(userId).select('role').exec();

      if (!user) {
        return res.status(404).json({
          code: 'NotFound',
          message: 'User not found',
        });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          code: 'AuthorizationError',
          message: 'Access denied, insufficient permissions',
        });
      }

      return next();
    } catch (error) {
      res.status(500).json({
        code: 'ServerError',
        message: 'Internal server error',
        error,
      });

      logger.error('Error in authorization', error);
    }
  };
};

export default authorize;
