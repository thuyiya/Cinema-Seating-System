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

// Screen routes
router.post('/', authenticateJWT, createScreen);
router.get('/', getScreens);
router.get('/:id',  getScreenById);
router.put('/:id', authenticateJWT, updateScreen);
router.delete('/:id', authenticateJWT, deleteScreen);

export default router; 