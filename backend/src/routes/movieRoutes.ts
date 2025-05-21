import { Router, RequestHandler } from 'express';
import { getMovies, getMovieById, createMovie, deleteMovieById, updateMovieById } from '../controllers/movieController';

const router = Router();

router.get('/movies', getMovies as RequestHandler);
router.get('/movies/:id', getMovieById as RequestHandler);
router.post('/movies', createMovie as RequestHandler);
router.delete('/movies/:id', deleteMovieById as RequestHandler);
router.put('/movies/:id', updateMovieById as RequestHandler);

export default router;