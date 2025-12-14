import { logger } from '../../../lib/winston.js';
import Blog from '../../../models/v1/blog.js';
import User from '../../../models/v1/user.js';
import config from '../../../config/index.js';

const getBlogBySlug = async (req, res) => {
  try {
    const userId = req.userId;
    const slug = req.params.slug;

    const user = await User.findById(userId).select('role').lean().exec();

    const blog = await Blog.findOne({ slug })
      .select('-banner.publicId -__v')
      .populate('author', '-createdAt -updatedAt -__v')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (!blog) {
      return res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
    }

    // Show only the published post to a normal user
    if (user?.role === 'user' && blog.status === 'draft') {
      logger.warn('A user tried to access a draft blog', {
        userId,
        blog,
      });

      return res.status(403).json({
        code: 'AuthorizationError',
        message: 'Access denied, insufficient perimissions',
      });
    }

    res.status(200).json({
      blog,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });

    logger.error('Error while fetching blogs by slug', error);
  }
};

export default getBlogBySlug;
