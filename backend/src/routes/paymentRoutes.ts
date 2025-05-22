import express from 'express';
import { processPayment, getPaymentDetails } from '../controllers/paymentController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// Process payment for a booking
router.post('/process', authenticateJWT, processPayment);

// Get payment details
router.get('/:paymentId', authenticateJWT, getPaymentDetails);

export default router; 