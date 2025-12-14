import { logger } from '../../../lib/winston.js';
import { v2 as cloudinary } from 'cloudinary';
import Blog from '../../../models/v1/blog.js';
import User from '../../../models/v1/user.js';

const deleteBlog = async (req, res) => {
  try {
    const userId = req.userId;
    const blogId = req.params.blogId;

    const user = await User.findById(userId).select('role').lean().exec();
    const blog = await Blog.findById(blogId)
      .select('author banner.publicId')
      .exec();

    if (!blog) {
      return res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
    }

    if (blog.author !== userId && user?.role !== 'admin') {
      logger.warn('A user tried to delete a blog without permission', {
        userId,
      });
      return res.status(403).json({
        code: 'AuthorizationError',
        message: 'Access denied',
      });
    }

    await cloudinary.uploader.destroy(blog.banner.publicId);
    logger.info('Blog banner deleted from Cloudinary', {
      publicId: blog.banner.publicId,
    });

    await Blog.deleteOne({ _id: blogId });
    logger.info('Blog delete successfully', {
      blogId,
    });

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });

    logger.error('Error while deleting a blog', error);
  }
};

export default deleteBlog;
