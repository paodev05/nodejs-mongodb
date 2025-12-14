import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import { body, param } from 'express-validator';
import validationError from '../../middlewares/validationError.js';
import commentBlog from '../../controllers/v1/comment/comment_blog.js';
import getCommentsByBlog from '../../controllers/v1/comment/get_comments_by_blog.js';
import deleteComment from '../../controllers/v1/comment/delete_comment.js';

const router = new Router();

router.post(
  '/blog/:blogId',
  authenticate,
  authorize(['admin', 'user']),
  param('blogId').isMongoId().withMessage('Invalid blog id'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  validationError,
  commentBlog,
);

router.get(
  '/blog/:blogId',
  authenticate,
  authorize(['admin', 'user']),
  param('blogId').isMongoId().withMessage('Invalid blog id'),
  validationError,
  getCommentsByBlog,
);

router.delete(
  '/:commentId',
  authenticate,
  authorize(['admin', 'user']),
  param('commentId').isMongoId().withMessage('Invalid comment id'),
  validationError,
  deleteComment,
);

export default router;
