import { logger } from '../../../lib/winston.js';
import Blog from '../../../models/v1/blog.js';
import Comment from '../../../models/v1/comment.js';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

const commentBlog = async (req, res) => {
  const { blogId } = req.params;
  const userId = req.userId;
  const { content } = req.body;

  try {
    const blog = await Blog.findById(blogId).select('_id commentsCount').exec();

    if (!blog) {
      return res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
    }

    const cleanContent = purify.sanitize(content);
    const newComment = await Comment.create({
      blogId,
      content: cleanContent,
      userId,
    });

    logger.info('New comment created', newComment);

    blog.commentsCount++;
    await blog.save();

    logger.info('Blog comments count update', {
      blogId: blog._id,
      commentsCount: blog.commentsCount,
    });

    return res.status(201).json({
      comment: newComment,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });

    logger.error('Error while commenting a blog', error);
  }
};

export default commentBlog;
