import express from 'express';
import { getMovies, createMovie, updateMovieById, deleteMovieById, getMovieById } from '../controllers/movieController';

const router = express.Router();

router.get('/movies', getMovies);
router.get('/movies/:id', getMovieById);
router.post('/movies', createMovie);
router.delete('/movies', deleteMovieById);
router.put('/movies', updateMovieById);

export default router;