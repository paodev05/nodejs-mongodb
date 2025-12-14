import { logger } from '../../../lib/winston.js';
import Blog from '../../../models/v1/blog.js';
import User from '../../../models/v1/user.js';
import config from '../../../config/index.js';

const getAllBlogs = async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || config.defaultResLimit;
    const offset = parseInt(req.query.offset) || config.defaultResOffset;

    const user = await User.findById(userId).select('role').lean().exec();
    const query = {};
    // Show only the published post to a normal user
    if (user?.role === 'user') {
      query.status = 'published';
    }

    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
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

    logger.error('Error while getting all blogs', error);
  }
};

export default getAllBlogs;
