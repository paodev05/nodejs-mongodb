import jwt from 'jsonwebtoken';
import { logger } from '../../../lib/winston.js';
import { generateAccessToken, verifyRefreshToken } from '../../../lib/jwt.js';
import Token from '../../../models/v1/token.js';
const { JsonWebTokenError, TokenExpiredError } = jwt;

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  try {
    const tokenExists = await Token.exists({ token: refreshToken });

    if (!tokenExists) {
      return res.status(401).json({
        code: 'AuthenticationError',
        message: 'Invalid refresh token',
      });
    }

    // Verify refresh token
    const jwtPayload = verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken(jwtPayload.userId);

    res.status(200).json({
      accessToken,
    });
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Refresh token has expired, please login again',
      });
      return;
    }

    if (error instanceof JsonWebTokenError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Invalid refresh token',
      });
      return;
    }

    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });

    logger.error('Error during token refresh:', error);
  }
};

export default refreshToken;
