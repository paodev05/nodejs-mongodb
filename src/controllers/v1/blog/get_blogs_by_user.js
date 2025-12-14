import { logger } from '../../../lib/winston.js';
import Blog from '../../../models/v1/blog.js';
import User from '../../../models/v1/user.js';
import config from '../../../config/index.js';

const getBlogsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.userId;
    const limit = parseInt(req.query.limit) || config.defaultResLimit;
    const offset = parseInt(req.query.offset) || config.defaultResOffset;

    const currentUser = await User.findById(currentUserId)
      .select('role')
      .lean()
      .exec();
    const query = {};
    // Show only the published post to a normal user
    if (currentUser?.role === 'user') {
      query.status = 'published';
    }

    const total = await Blog.countDocuments({ author: userId, ...query });
    const blogs = await Blog.find({ author: userId, ...query })
      .select('-banner.publicId -__v')
      .populate('author', '-createdAt -updatedAt -__v')
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.status(200).json({
      limit,
      offset,
      total,
      blogs,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });

    logger.error('Error while fetching blogs by user', error);
  }
};

export default getBlogsByUser;
