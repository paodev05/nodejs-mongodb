import { logger } from '../../../lib/winston.js';
import Blog from '../../../models/v1/blog.js';
import Comment from '../../../models/v1/comment.js';

const getCommentsByBlog = async (req, res) => {
  const { blogId } = req.params;

  try {
    const blog = await Blog.findById(blogId).select('_id').lean().exec();

    if (!blog) {
      return res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
    }

    const allComments = await Comment.find({ blogId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return res.status(200).json({
      comments: allComments,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });

    logger.error('Error while retrieving comments', error);
  }
};

export default getCommentsByBlog;
