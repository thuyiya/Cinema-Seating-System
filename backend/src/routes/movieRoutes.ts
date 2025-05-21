import express from 'express';
import { getMovies } from '../controllers/movieController';

const router = express.Router();

router.get('/movies', getMovies);

export default router;