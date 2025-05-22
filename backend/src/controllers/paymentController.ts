import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Payment from '../models/Payment';
import { Booking } from '../models/Booking';
import { generateTransactionId } from '../utils/helpers';

export const processPayment = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookingId, cardDetails } = req.body;

    // Validate booking exists and is pending payment
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }
    if (booking.status !== 'temporary') {
      throw new Error('Invalid booking status');
    }

    // Process card payment (mock implementation)
    const lastFourDigits = cardDetails.number.slice(-4);
    const [expiryMonth, expiryYear] = cardDetails.expiry.split('/');
    
    // Create payment record
    const payment = new Payment({
      bookingId: booking._id,
      amount: booking.totalAmount,
      cardDetails: {
        lastFourDigits,
        expiryMonth,
        expiryYear
      },
      status: 'completed',
      transactionId: generateTransactionId()
    });

    await payment.save({ session });

    // Update booking status
    booking.status = 'completed';
    booking.paymentStatus = 'completed';
    await booking.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      payment: {
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.status
      }
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Payment processing failed'
    });
  } finally {
    session.endSession();
  }
};

export const getPaymentDetails = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId)
      .populate('bookingId', 'status paymentStatus totalAmount');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch payment details'
    });
  }
}; 