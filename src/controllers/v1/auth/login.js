import { generateAccessToken, generateRefreshToken } from '../../../lib/jwt.js';
import { logger } from '../../../lib/winston.js';
import User from '../../../models/v1/user.js';
import Token from '../../../models/v1/token.js';
import config from '../../../config/index.js';

const login = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email })
      .select('username email password role')
      .lean()
      .exec();

    if (!user) {
      res.status(404).json({
        code: 'NotFoundError',
        message: 'User not found',
      });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in db
    await Token.create({ token: refreshToken, userId: user._id });
    logger.info('Refresh token stored in database', {
      userId: user._id,
      token: refreshToken,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    res.status(201).json({
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });

    logger.info('User registered successfully', user);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });

    logger.error('Error during user registration:', error);
  }
};

export default login;
