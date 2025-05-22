import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateRegistration = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\d{10}$/)
    .withMessage('Phone number must be 10 digits'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
]; 