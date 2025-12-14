import { Router } from 'express';
import { param, query, body } from 'express-validator';
import authenticate from '../../middlewares/authenticate.js';
import validationError from '../../middlewares/validationError.js';
import authorize from '../../middlewares/authorize.js';
import createBlog from '../../controllers/v1/blog/create_blog.js';
import multer from 'multer';
import uploadBlogBanner from '../../middlewares/uploadBlogBanner.js';
import getAllBlogs from '../../controllers/v1/blog/get_all_blogs.js';
import getBlogsByUser from '../../controllers/v1/blog/get_blogs_by_user.js';
import getBlogBySlug from '../../controllers/v1/blog/get_blog_by_slug.js';
import updateBlog from '../../controllers/v1/blog/update_blog.js';
import deleteBlog from '../../controllers/v1/blog/delete_blog.js';

const upload = multer();

const router = new Router();

router.post(
  '/',
  authenticate,
  authorize(['admin']),
  upload.single('banner_image'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required.')
    .isLength({ max: 180 })
    .withMessage('Title must be less than 180 characters'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be draft or published'),
  validationError,
  uploadBlogBanner('post'),
  createBlog,
);

router.get(
  '/',
  authenticate,
  authorize(['admin', 'user']),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 to 50'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a positive integer'),
  validationError,
  getAllBlogs,
);

router.get(
  '/user/:userId',
  authenticate,
  authorize(['admin', 'user']),
  param('userId').isMongoId().withMessage('Invalid user id'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 to 50'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a positive integer'),
  validationError,
  getBlogsByUser,
);

router.get(
  '/:slug',
  authenticate,
  authorize(['admin', 'user']),
  param('slug').notEmpty().withMessage('Slug is required'),
  validationError,
  getBlogBySlug,
);

router.put(
  '/:blogId',
  authenticate,
  authorize(['admin']),
  param('blogId').isMongoId().withMessage('Invalid blog id'),
  upload.single('banner_image'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 180 })
    .withMessage('Title must be less than 180 characters'),
  body('content').trim(),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be draft or published'),
  validationError,
  uploadBlogBanner('put'),
  updateBlog,
);

router.delete(
  '/:blogId',
  authenticate,
  authorize(['admin', 'user']),
  deleteBlog,
);
export default router;
