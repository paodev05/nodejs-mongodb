import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import likeBlog from '../../controllers/v1/like/like_blog.js';
import { body, param } from 'express-validator';
import validationError from '../../middlewares/validationError.js';
import unlikeBlog from '../../controllers/v1/like/unlike_blog.js';

const router = new Router();

router.post(
  '/blog/:blogId',
  authenticate,
  authorize(['admin', 'user']),
  param('blogId').isMongoId().withMessage('Invalid blog id'),
  // body('userId')
  //   .notEmpty()
  //   .withMessage('User id is required')
  //   .isMongoId()
  //   .withMessage('Invalid user id'),
  validationError,
  likeBlog,
);

router.delete(
  '/blog/:blogId',
  authenticate,
  authorize(['admin', 'user']),
  param('blogId').isMongoId().withMessage('Invalid blog id'),
  // body('userId')
  //   .notEmpty()
  //   .withMessage('User id is required')
  //   .isMongoId()
  //   .withMessage('Invalid user id'),
  validationError,
  unlikeBlog,
);

export default router;
