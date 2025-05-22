import { Request, Response } from 'express';
import { Booking, IBooking } from '../models/Booking';
import { IUser, User, UserRole } from '../models/User';
import { Showtime } from '../models/Showtime';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const GUEST_PASSWORD = 'GUEST_2323kajs';

export const createBooking = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { showtimeId, seats, guestInfo, totalAmount } = req.body;
    let userId = req.user?._id;

    // If no user is logged in, create a guest user
    if (!userId && guestInfo) {
      const guestUser = new User({
        name: guestInfo.name,
        email: guestInfo.email,
        phone: guestInfo.mobile, // Use 'phone' as per your model
        password: await bcrypt.hash(GUEST_PASSWORD, 10),
        role: 'guest'
      });
      await guestUser.save({ session });
      userId = guestUser._id;
    }

    if (!userId) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'User information is required' });
    }

    // Validate showtime exists
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Showtime not found' });
    }

    // Convert seat IDs to ObjectIds
    const seatIds = seats.map((seat: any) => new mongoose.Types.ObjectId(seat.seatId));

    // Check for conflicts with existing bookings
    const hasConflicts = await (Booking as any).checkSeatConflicts(
      new mongoose.Types.ObjectId(showtimeId),
      seatIds
    );

    if (hasConflicts) {
      await session.abortTransaction();
      return res.status(409).json({ 
        message: 'Some seats are no longer available',
        code: 'SEAT_CONFLICT'
      });
    }

    // Create booking
    const booking = new Booking({
      userId,
      showtimeId,
      seats,
      totalAmount,
      status: 'temporary',
      paymentStatus: 'pending'
    });

    await booking.save({ session });

    // Update showtime's booked seats
    showtime.bookedSeats.push(...seats.map((seat: any) => ({
      seatId: seat.seatId,
      bookingId: booking._id
    })));
    await showtime.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      bookingId: booking._id,
      expiresAt: booking.expiresAt,
      status: booking.status
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking' });
  } finally {
    session.endSession();
  }
};

export const completeBooking = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookingId } = req.params;
    const { paymentDetails } = req.body;

    const booking = await Booking.findById(bookingId) as IBooking;
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if booking has expired
    if (booking.status === 'temporary' && booking.expiresAt && booking.expiresAt < new Date()) {
      booking.status = 'cancelled';
      await booking.save({ session });
      await session.commitTransaction();
      return res.status(410).json({ 
        message: 'Booking has expired',
        code: 'BOOKING_EXPIRED'
      });
    }

    // Process payment (mock for now)
    const paymentSuccessful = true; // Replace with actual payment processing

    if (paymentSuccessful) {
      booking.status = 'completed';
      booking.paymentStatus = 'completed';
      (booking as any).generateTicketNumber();
      await booking.save({ session });

      await session.commitTransaction();

      res.json({
        bookingId: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        ticketNumber: booking.ticketNumber
      });
    } else {
      booking.paymentStatus = 'failed';
      await booking.save({ session });
      await session.commitTransaction();
      
      res.status(400).json({
        message: 'Payment failed',
        code: 'PAYMENT_FAILED'
      });
    }

  } catch (error) {
    await session.abortTransaction();
    console.error('Error completing booking:', error);
    res.status(500).json({ message: 'Error completing booking' });
  } finally {
    session.endSession();
  }
};

export const getBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?._id;

    const booking = await Booking.findById(bookingId)
      .populate('showtimeId')
      .populate('userId', 'name email mobile');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only allow access to own bookings unless admin
    if (req.user?.role !== UserRole.ADMIN && booking.userId.toString() !== userId?.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);

  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Error fetching booking' });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookingId } = req.params;
    const userId = req.user?._id;

    const booking = await Booking.findById(bookingId) as IBooking;
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only allow cancellation of own bookings unless admin
    if (req.user?.role !== UserRole.ADMIN && booking.userId.toString() !== userId?.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Only allow cancellation of temporary bookings
    if (booking.status !== 'temporary') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Cannot cancel a completed booking' });
    }

    booking.status = 'cancelled';
    await booking.save({ session });

    // Remove seats from showtime's booked seats
    const showtime = await Showtime.findById(booking.showtimeId);
    if (showtime) {
      showtime.bookedSeats = showtime.bookedSeats.filter(
        seat => !booking.seats.find(bs => bs.seatId.toString() === seat.seatId.toString())
      );
      await showtime.save({ session });
    }

    await session.commitTransaction();
    res.json({ message: 'Booking cancelled successfully' });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling booking' });
  } finally {
    session.endSession();
  }
}; 