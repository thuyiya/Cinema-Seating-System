import { Router } from 'express';
import type { RequestHandler } from 'express';
import { login, registerUser, registerAdmin } from '../controllers/authController';
import { validateAdminSecretKey } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/login', login as RequestHandler);
router.post('/register', registerUser as RequestHandler);

// Admin registration (protected by secret key)
router.post('/admin/register', validateAdminSecretKey as RequestHandler, registerAdmin as RequestHandler);

export default router; 