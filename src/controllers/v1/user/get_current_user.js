import { logger } from '../../../lib/winston.js';
import User from '../../../models/v1/user.js';

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select('-__v').lean().exec();

    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });

    logger.error('Error while getting current user', error);
  }
};

export default getCurrentUser;
