import { logger } from '../../../lib/winston.js';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import Blog from '../../../models/v1/blog.js';
import User from '../../../models/v1/user.js';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

const updateBlog = async (req, res) => {
  try {
    const { title, content, banner, status } = req.body;
    const userId = req.userId;
    const blogId = req.params.blogId;

    const user = await User.findById(userId).select('role').exec();
    const blog = await Blog.findById(blogId).select('-__v').exec();

    if (!blog) {
      return res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
    }

    if (blog.author !== userId && user?.role !== 'admin') {
      logger.warn('A user tried to update a blog without permission', {
        userId,
        blog,
      });
      return res.status(403).json({
        code: 'AuthorizationError',
        message: 'Access denied',
      });
    }

    if (title) blog.title = title;
    if (content) {
      const cleanContent = purify.sanitize(content);
      blog.content = cleanContent;
    }
    if (banner) blog.banner = banner;
    if (status) blog.status = status;

    await blog.save();
    logger.info('Blog updated', { blog });

    res.status(200).json({
      blog,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });

    logger.error('Error while updating a blog', error);
  }
};

export default updateBlog;
