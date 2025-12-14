import { logger } from '../../../lib/winston.js';
import User from '../../../models/v1/user.js';
import config from '../../../config/index.js';

const getAllUser = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || config.defaultResLimit;
    const offset = parseInt(req.query.offset) || config.defaultResOffset;
    const total = await User.countDocuments();

    const users = await User.find()
      .select('-__v')
      .limit(limit)
      .skip(offset)
      .lean()
      .exec();

    res.status(200).json({
      limit,
      offset,
      total,
      users,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });

    logger.error('Error while getting all users', error);
  }
};

export default getAllUser;
