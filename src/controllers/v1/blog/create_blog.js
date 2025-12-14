import { logger } from '../../../lib/winston.js';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import Blog from '../../../models/v1/blog.js';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

const createBlog = async (req, res) => {
  try {
    const { title, content, banner, status } = req.body;
    const userId = req.userId;

    const cleanContent = purify.sanitize(content);

    const newBlog = await Blog.create({
      title,
      content: cleanContent,
      banner,
      status,
      author: userId,
    });

    logger.info('New blog created', newBlog);

    res.status(201).json({
      blog: newBlog,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });

    logger.error('Error while creating blog', error);
  }
};

export default createBlog;
