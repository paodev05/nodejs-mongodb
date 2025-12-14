import { logger } from '../../../lib/winston.js';
import config from '../../../config/index.js';
import User from '../../../models/v1/user.js';
import Token from '../../../models/v1/token.js';
import { genUsername } from '../../../utils/index.js';
import { generateAccessToken, generateRefreshToken } from '../../../lib/jwt.js';

const register = async (req, res) => {
  const { email, password, role } = req.body;

  if (role === 'admin' && !config.WHITELIST_ADMINS.includes(email)) {
    res.status(403).json({
      code: 'AuthorizationError',
      message: 'You cannot register as an admin',
    });

    logger.warn(`Unauthorized admin registration attempt: ${email}`);
    return;
  }

  try {
    const username = genUsername();

    const newUser = await User.create({
      username,
      email,
      password,
      role,
    });

    // Generate tokens
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    // Store refresh token in db
    await Token.create({ token: refreshToken, userId: newUser._id });
    logger.info('Refresh token stored in database', {
      userId: newUser._id,
      token: refreshToken,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    res.status(201).json({
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      accessToken,
    });

    logger.info('User registered successfully:', {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });

    logger.error('Error during user registration:', error);
  }
};

export default register;
