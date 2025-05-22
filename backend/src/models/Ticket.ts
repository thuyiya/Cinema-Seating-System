import mongoose, { Schema, Document } from 'mongoose';
import { IMovie } from './Movie';
import { IShowtime } from './Showtime';
import { IUser } from './User';
import { IPayment } from './Payment';
import { IBooking } from './Booking';

// Interface for populated showtime with movie
interface PopulatedShowtime extends Omit<IShowtime, 'movieId'> {
  movieId: IMovie;
}

// Interface for seat in ticket
interface ITicketSeat {
  seatId: mongoose.Types.ObjectId;
  row: string;
  number: number;
  type: 'REGULAR' | 'VIP' | 'ACCESSIBLE';
}

// Interface for populated ticket
export interface ITicket extends Document {
  ticketNumber: string;
  bookingId: mongoose.Types.ObjectId | IBooking;
  userId: mongoose.Types.ObjectId | IUser;
  showtimeId: mongoose.Types.ObjectId | PopulatedShowtime;
  seats: ITicketSeat[];
  totalAmount: number;
  paymentId: mongoose.Types.ObjectId | IPayment;
  status: 'active' | 'used' | 'cancelled';
  qrCode: string;
  createdAt: Date;
  updatedAt: Date;
  generateQRCode(): void;
}

const TicketSchema: Schema = new Schema({
  ticketNumber: {
    type: String,
    required: true,
    unique: true
  },
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  showtimeId: {
    type: Schema.Types.ObjectId,
    ref: 'Showtime',
    required: true
  },
  seats: [{
    seatId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    row: {
      type: String,
      required: true
    },
    number: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['REGULAR', 'VIP', 'ACCESSIBLE'],
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'used', 'cancelled'],
    default: 'active'
  },
  qrCode: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Method to generate QR code
TicketSchema.methods.generateQRCode = function() {
  const qrData = {
    ticketNumber: this.ticketNumber,
    seats: this.seats.map((seat: ITicketSeat) => `${seat.row}${seat.number}`).join(','),
    timestamp: Date.now()
  };
  this.qrCode = Buffer.from(JSON.stringify(qrData)).toString('base64');
};

export default mongoose.model<ITicket>('Ticket', TicketSchema); 