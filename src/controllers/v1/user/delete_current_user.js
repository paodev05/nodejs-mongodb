import { logger } from '../../../lib/winston.js';
import User from '../../../models/v1/user.js';
import { v2 as cloudinary } from 'cloudinary';
import Blog from '../../../models/v1/blog.js';
import blog from '../../../models/v1/blog.js';

const deleteCurrentUser = async (req, res) => {
  const userId = req.userId;

  try {
    const blogs = await Blog.find({ author: userId })
      .select('banner.publicId')
      .lean()
      .exec();

    const publicIds = blogs.map(({ banner }) => banner.publicId);
    await cloudinary.api.delete_resources(publicIds);

    logger.info('Multiple blog banners deleted from Cloudinary', { publicIds });

    await Blog.deleteMany({ author: userId });
    logger.info('Multiple blogs deleted', {
      userId,
      blogs,
    });

    await User.deleteOne({ _id: userId });

    logger.info('A user account has been deleted', {
      userId,
    });

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });

    logger.error('Error while deleting current user', error);
  }
};

export default deleteCurrentUser;
