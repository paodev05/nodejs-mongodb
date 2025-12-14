import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './user.js';
import blogRoutes from './blog.js';
import likeRoutes from './like.js';
import commentRoutes from './comment.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to API v1',
    status: 'OK',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/blogs', blogRoutes);
router.use('/likes', likeRoutes);
router.use('/comments', commentRoutes);

export default router;
