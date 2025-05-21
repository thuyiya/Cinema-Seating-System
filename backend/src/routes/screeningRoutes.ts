import { Router, RequestHandler } from 'express';
import { getScreenings, getScreeningById, createScreening, updateScreeningById, deleteScreeningById } from '../controllers/screeningController';

const router = Router();

router.get('/screenings', getScreenings as RequestHandler);
router.get('/screenings/:id', getScreeningById as RequestHandler);
router.post('/screenings', createScreening as RequestHandler);
router.put('/screenings/:id', updateScreeningById as RequestHandler);
router.delete('/screenings/:id', deleteScreeningById as RequestHandler);

export default router; 