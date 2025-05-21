import express from 'express';
import {
  createShowtime,
  getShowtimes,
  getShowtimeById,
  updateShowtime,
  deleteShowtime,
} from '../controllers/showtimeController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getShowtimes);
router.get('/movie/:movieId', getShowtimes);
router.get('/:id', getShowtimeById);

// Protected routes (admin only)
router.post('/', authenticateJWT, createShowtime);
router.put('/:id', authenticateJWT, updateShowtime);
router.delete('/:id', authenticateJWT, deleteShowtime);

export default router; 