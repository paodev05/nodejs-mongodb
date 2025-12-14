import { logger } from '../lib/winston.js';
import Blog from '../models/v1/blog.js';
import uploadToCloudinary from '../lib/cloudinary.js';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2mb

const uploadBlogBanner = (method) => {
  return async (req, res, next) => {
    if (method === 'put' && !req.file) {
      next();
      return;
    }

    if (!req.file) {
      return res.status(400).json({
        code: 'ValidationError',
        message: 'Blog banner is required',
      });
    }

    if (req.file.size > MAX_FILE_SIZE) {
      return res.status(413).json({
        code: 'ValidationError',
        message: 'File size must be less than 2MB',
      });
    }

    try {
      const { blogId } = req.params;
      const blog = await Blog.findById(blogId).select('banner.publicId').exec();
      const data = await uploadToCloudinary(
        req.file.buffer,
        blog?.banner.publicId.replace('blog-api/', ''),
      );

      if (!data) {
        res.status(500).json({
          code: 'ServerError',
          message: 'Internal Server Error',
        });

        logger.error('Error while uploading blog banner to cloudinary', {
          blogId,
          publicId: blog?.banner.publicId,
        });

        return;
      }

      const newBanner = {
        publicId: data.public_id,
        url: data.secure_url,
        width: data.width,
        height: data.height,
      };

      logger.info('Blog banner uploaded to Cloudinary', {
        blogId,
        banner: newBanner,
      });

      req.body.banner = newBanner;
      next();
    } catch (error) {
      res.status(error.http_code).json({
        code: error.http_code < 500 ? 'ValidationError' : error.name,
        message: error.message,
      });
      logger.error('Error while uploading blog banner to cloudinary', error);
      return;
    }
  };
};

export default uploadBlogBanner;
