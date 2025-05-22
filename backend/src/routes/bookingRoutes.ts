import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { createBooking, completeBooking, getBooking, cancelBooking } from '../controllers/bookingController';
import { authenticateJWTOptional } from '../middleware/auth';

const router = express.Router();

// Helper to convert controller to express handler
const wrapHandler = (
  handler: (req: Request, res: Response) => Promise<any>
): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
};

// Create booking (accessible to both logged-in and guest users)
router.post('/', authenticateJWTOptional, wrapHandler(createBooking));

// Complete booking (process payment)
router.post('/:bookingId/complete', authenticateJWTOptional, wrapHandler(completeBooking));

// Get booking details (requires authentication to verify ownership)
router.get('/:bookingId', wrapHandler(getBooking));

// Cancel booking (requires authentication to verify ownership)
router.delete('/:bookingId', authenticateJWTOptional, wrapHandler(cancelBooking));

export default router; 