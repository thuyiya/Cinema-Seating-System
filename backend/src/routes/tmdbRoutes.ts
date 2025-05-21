import express from 'express';
import { getMovies } from '../controllers/tmdbController';

const router = express.Router();

router.get('/', getMovies);

export default router; 