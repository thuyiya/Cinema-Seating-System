import express from 'express';
import { processPayment, getPaymentDetails } from '../controllers/paymentController';

const router = express.Router();

// Process payment for a booking (no auth required)
router.post('/process', processPayment);

// Get payment details (no auth required)
router.get('/:paymentId', getPaymentDetails);

export default router; 