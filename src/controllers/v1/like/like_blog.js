import { logger } from '../../../lib/winston.js';
import Blog from '../../../models/v1/blog.js';
import Like from '../../../models/v1/like.js';

const likeBlog = async (req, res) => {
  const { blogId } = req.params;
  const userId = req.userId;

  try {
    const blog = await Blog.findById(blogId).select('likesCount').exec();

    if (!blog) {
      return res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
    }

    const existingLike = await Like.findOne({ blogId, userId }).lean().exec();
    if (existingLike) {
      return res.status(400).json({
        code: 'BadRequest',
        message: 'You already liked this blog',
      });
    }

    await Like.create({ blogId, userId });
    blog.likesCount++;
    await blog.save();

    logger.info('Blog liked successfully', {
      userId,
      blogId: blog._id,
      likesCount: blog.likesCount,
    });

    return res.status(200).json({
      likesCount: blog.likesCount,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });

    logger.error('Error while liking a blog', error);
  }
};

export default likeBlog;
