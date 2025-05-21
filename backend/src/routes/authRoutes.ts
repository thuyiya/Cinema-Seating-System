import { Router, RequestHandler } from 'express';
import { body } from 'express-validator';
import { login, register } from '../controllers/authController';

const router = Router();

// Validation middleware
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .exists()
    .withMessage('Password is required'),
];

// Routes
router.post('/register', registerValidation, register as RequestHandler);
router.post('/login', loginValidation, login as RequestHandler);

export default router; 