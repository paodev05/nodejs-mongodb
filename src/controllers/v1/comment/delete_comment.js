import { logger } from '../../../lib/winston.js';
import Blog from '../../../models/v1/blog.js';
import Comment from '../../../models/v1/comment.js';
import User from '../../../models/v1/user.js';

const deleteComment = async (req, res) => {
  const currentUserId = req.userId;
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId)
      .select('userId blogId')
      .exec();
    const user = await User.findById(currentUserId)
      .select('role')
      .lean()
      .exec();

    if (!comment) {
      return res.status(404).json({
        code: 'NotFound',
        message: 'Comment not found',
      });
    }

    const blog = await Blog.findById(comment.blogId)
      .select('commentsCount')
      .exec();

    if (!blog) {
      return res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
    }

    if (comment.userId !== currentUserId && user?.role !== 'admin') {
      logger.info('A user tried to delete a comment without permission', {
        userId: currentUserId,
        comment,
      });
      return res.status(403).json({
        code: 'AuthorizationError',
        message: 'Access denied',
      });
    }

    await Comment.deleteOne({ _id: commentId });
    logger.info('Comment delete successfully', {
      commentId,
    });

    blog.commentsCount--;
    await blog.save();

    logger.info('Blog comments count updated', {
      blogId: blog._id,
      commentsCount: blog.commentsCount,
    });

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });

    logger.error('Error while deleting comment', error);
  }
};

export default deleteComment;
