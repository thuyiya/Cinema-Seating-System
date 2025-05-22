import express from 'express';
import { getTicketDetails } from '../controllers/ticketController';

const router = express.Router();

// Get ticket details by booking ID
router.get('/:bookingId', getTicketDetails);

export default router; 