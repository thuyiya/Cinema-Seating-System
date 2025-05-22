import express from 'express';
import {
  createShowtime,
  getShowtimes,
  getShowtimeById,
  updateShowtime,
  deleteShowtime,
  getShowtimeSeats
} from '../controllers/showtimeController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getShowtimes);
router.get('/:id', getShowtimeById);
router.get('/:showtimeId/:screenId/seats', getShowtimeSeats);

// Protected routes
router.post('/', authenticateJWT, createShowtime);
router.put('/:id', authenticateJWT, updateShowtime);
router.delete('/:id', authenticateJWT, deleteShowtime);

export default router; 