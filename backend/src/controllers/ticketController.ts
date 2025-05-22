import { Request, Response } from 'express';
import Ticket, { ITicket } from '../models/Ticket';
import { IBooking, Booking } from '../models/Booking';
import { IPayment } from '../models/Payment';
import Payment from '../models/Payment';
import { IMovie } from '../models/Movie';
import { IShowtime } from '../models/Showtime';
import { IUser } from '../models/User';

interface PopulatedTicket extends Omit<ITicket, 'showtimeId' | 'userId' | 'paymentId'> {
  showtimeId: Omit<IShowtime, 'movieId'> & {
    movieId: Pick<IMovie, 'title' | 'posterUrl' | 'duration'>;
    screenId: string;
  };
  userId: Pick<IUser, 'name' | 'email' | 'phone'>;
  paymentId: Pick<IPayment, 'transactionId' | 'status'>;
}

export const createTicket = async (booking: IBooking, payment: IPayment): Promise<ITicket> => {
  try {
    const ticket = new Ticket({
      ticketNumber: booking.ticketNumber,
      bookingId: booking._id,
      userId: booking.userId,
      showtimeId: booking.showtimeId,
      seats: booking.seats,
      totalAmount: booking.totalAmount,
      paymentId: payment._id,
      status: 'active'
    });

    // Generate QR code before saving
    ticket.generateQRCode();
    await ticket.save();
    return ticket;
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
};

export const getTicketDetails = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    const ticket = await Ticket.findOne({ 
      $or: [
        { bookingId: bookingId }
      ]
    })
    .populate({
      path: 'showtimeId',
      select: 'movieId screenId date startTime endTime',
      populate: {
        path: 'movieId',
        select: 'title posterUrl duration'
      }
    })
    .populate('userId', 'name email phone')
    .populate('bookingId', 'status paymentStatus')
    .populate('paymentId', 'transactionId status');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Type assertion for populated fields
    const populatedTicket = ticket as unknown as PopulatedTicket;

    res.status(200).json({
      success: true,
      ticket: {
        ticketNumber: populatedTicket.ticketNumber,
        movieDetails: {
          title: populatedTicket.showtimeId.movieId.title,
          posterUrl: populatedTicket.showtimeId.movieId.posterUrl,
          duration: populatedTicket.showtimeId.movieId.duration
        },
        showtime: {
          date: populatedTicket.showtimeId.date,
          startTime: populatedTicket.showtimeId.startTime,
          endTime: populatedTicket.showtimeId.endTime,
          screen: populatedTicket.showtimeId.screenId
        },
        seats: populatedTicket.seats,
        totalAmount: populatedTicket.totalAmount,
        customerDetails: {
          name: populatedTicket.userId.name,
          email: populatedTicket.userId.email,
          phone: populatedTicket.userId.phone
        },
        status: populatedTicket.status,
        qrCode: populatedTicket.qrCode,
        payment: {
          transactionId: populatedTicket.paymentId.transactionId,
          status: populatedTicket.paymentId.status
        }
      }
    });
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket details'
    });
  }
}; 