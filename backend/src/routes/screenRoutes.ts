import express from 'express';
import {
  createScreen,
  getScreens,
  getScreenById,
  updateScreen,
  deleteScreen
} from '../controllers/screenController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateJWT);

// Screen routes
router.post('/', createScreen);
router.get('/', getScreens);
router.get('/:id', getScreenById);
router.put('/:id', updateScreen);
router.delete('/:id', deleteScreen);

export default router; 