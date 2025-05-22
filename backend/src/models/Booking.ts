import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  showtimeId: mongoose.Types.ObjectId;
  seats: Array<{
    seatId: mongoose.Types.ObjectId;
    row: string;
    number: number;
    type: 'REGULAR' | 'VIP' | 'ACCESSIBLE';
  }>;
  totalAmount: number;
  status: 'temporary' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  ticketNumber?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BOOKING_EXPIRY_MINUTES = 10;

const bookingSchema = new Schema<IBooking>({
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
  status: {
    type: String,
    enum: ['temporary', 'completed', 'cancelled'],
    default: 'temporary'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  ticketNumber: {
    type: String,
    sparse: true,
    unique: true
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for temporary bookings cleanup
bookingSchema.index({ status: 1, expiresAt: 1 });

// Index for checking seat conflicts
bookingSchema.index({ showtimeId: 1, 'seats.seatId': 1, status: 1 });

// Middleware to set expiration for temporary bookings
bookingSchema.pre('save', function(next) {
  if (this.isNew && this.status === 'temporary' && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + BOOKING_EXPIRY_MINUTES * 60 * 1000);
  }
  next();
});

// Static method to check for seat conflicts
bookingSchema.statics.checkSeatConflicts = async function(
  showtimeId: mongoose.Types.ObjectId,
  seatIds: mongoose.Types.ObjectId[]
): Promise<boolean> {
  const conflicts = await this.find({
    showtimeId,
    'seats.seatId': { $in: seatIds },
    status: { $in: ['temporary', 'completed'] },
    $or: [
      { status: 'completed' },
      { 
        status: 'temporary',
        expiresAt: { $gt: new Date() }
      }
    ]
  });
  
  return conflicts.length > 0;
};

// Static method to cleanup expired bookings
bookingSchema.statics.cleanupExpiredBookings = async function() {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find all expired temporary bookings
    const expiredBookings = await this.find({
      status: 'temporary',
      expiresAt: { $lte: new Date() }
    }).session(session);

    // Update their status to cancelled
    await this.updateMany(
      {
        status: 'temporary',
        expiresAt: { $lte: new Date() }
      },
      {
        $set: { status: 'cancelled', paymentStatus: 'failed' }
      }
    ).session(session);

    // Remove the seats from corresponding showtimes
    for (const booking of expiredBookings) {
      const showtime = await mongoose.model('Showtime').findById(booking.showtimeId).session(session);
      if (showtime) {
        // Remove only the seats associated with this booking
        showtime.bookedSeats = showtime.bookedSeats.filter(
          (seat: { bookingId: mongoose.Types.ObjectId }) => seat.bookingId.toString() !== booking._id.toString()
        );
        
        // Update available seats count
        booking.seats.forEach((seat: { type: string }) => {
          const seatType = seat.type.toUpperCase();
          if (showtime.availableSeats[seatType] !== undefined) {
            showtime.availableSeats[seatType] += 1;
          }
        });
        
        await showtime.save();
      }
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.error('Error cleaning up expired bookings:', error);
  } finally {
    session.endSession();
  }
};

interface IBookingSeat {
  seatId: mongoose.Types.ObjectId;
  type: string;
}

interface IBookingDocument extends Document {
  _id: mongoose.Types.ObjectId;
  seats: IBookingSeat[];
}

interface IShowtimeSeat {
  bookingId: mongoose.Types.ObjectId;
  seatId: mongoose.Types.ObjectId;
}

// Static method to cleanup orphaned seat bookings
bookingSchema.statics.cleanupOrphanedSeats = async function() {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get all showtimes
    const showtimes = await mongoose.model('Showtime').find({}).session(session);

    for (const showtime of showtimes) {
      // Get all valid booking IDs for this showtime
      const validBookings = await this.find({
        _id: { $in: showtime.bookedSeats.map((seat: IShowtimeSeat) => seat.bookingId) },
        status: { $in: ['temporary', 'completed'] },
        $or: [
          { status: 'completed' },
          { 
            status: 'temporary',
            expiresAt: { $gt: new Date() }
          }
        ]
      }).session(session) as IBookingDocument[];

      const validBookingIds = validBookings.map(booking => booking._id.toString());

      // Filter out seats with invalid bookings
      const originalSeatsCount = showtime.bookedSeats.length;
      showtime.bookedSeats = showtime.bookedSeats.filter(
        (seat: IShowtimeSeat) => validBookingIds.includes(seat.bookingId.toString())
      );

      // If seats were removed, update available seats count
      const removedSeatsCount = originalSeatsCount - showtime.bookedSeats.length;
      if (removedSeatsCount > 0) {
        // Since we don't know the exact seat types that were removed,
        // we'll need to recalculate from the screen configuration
        const screen = await mongoose.model('Screen').findById(showtime.screenId).session(session);
        if (screen) {
          const availableSeats = {
            REGULAR: screen.sections.reduce((total: number, section: { seats: Array<{ type: string; status: string }> }) => 
              total + section.seats.filter(seat => 
                seat.type === 'REGULAR' && seat.status === 'available'
              ).length, 0),
            VIP: screen.sections.reduce((total: number, section: { seats: Array<{ type: string; status: string }> }) => 
              total + section.seats.filter(seat => 
                seat.type === 'VIP' && seat.status === 'available'
              ).length, 0),
            ACCESSIBLE: screen.sections.reduce((total: number, section: { seats: Array<{ type: string; status: string }> }) => 
              total + section.seats.filter(seat => 
                seat.type === 'ACCESSIBLE' && seat.status === 'available'
              ).length, 0)
          };

          // Subtract currently booked seats
          showtime.bookedSeats.forEach((bookedSeat: IShowtimeSeat) => {
            const booking = validBookings.find(b => b._id.toString() === bookedSeat.bookingId.toString());
            if (booking) {
              const seat = booking.seats.find(s => s.seatId.toString() === bookedSeat.seatId.toString());
              if (seat) {
                availableSeats[seat.type as keyof typeof availableSeats] -= 1;
              }
            }
          });

          showtime.availableSeats = availableSeats;
        }
        await showtime.save();
      }
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.error('Error cleaning up orphaned seats:', error);
  } finally {
    session.endSession();
  }
};

// Method to generate ticket number
bookingSchema.methods.generateTicketNumber = function() {
  const date = new Date();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  this.ticketNumber = `TKT${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${random}`;
};

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema); 