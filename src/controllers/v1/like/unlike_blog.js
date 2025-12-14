import { logger } from '../../../lib/winston.js';
import Blog from '../../../models/v1/blog.js';
import Like from '../../../models/v1/like.js';

const unlikeBlog = async (req, res) => {
  const { blogId } = req.params;
  const userId = req.userId;

  try {
    const existingLike = await Like.findOne({ userId, blogId }).lean().exec();

    if (!existingLike) {
      return res.status(400).json({
        code: 'NotFound',
        message: 'Like not found',
      });
    }

    await Like.deleteOne({ _id: existingLike._id });
    const blog = await Blog.findById(blogId).select('likesCount').exec();
    if (!blog) {
      return res.status(400).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
    }

    blog.likesCount--;
    await blog.save();

    logger.info('Blog unliked successfully', {
      userId,
      blogId: blog._id,
      likesCount: blog.likesCount,
    });

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });

    logger.error('Error while unliking a blog', error);
  }
};

export default unlikeBlog;
