import { validationResult } from 'express-validator';

const validationError = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      code: 'ValidationError',
      errors: errors.mapped(), // Return errors in a mapped format
    });
    return;
  }
  next();
};

export default validationError;
