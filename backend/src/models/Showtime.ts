import mongoose, { Document, Schema } from 'mongoose';

export interface IShowtime extends Document {
  movieId: mongoose.Types.ObjectId;
  screenId: mongoose.Types.ObjectId;
  date: Date;
  startTime: string; // 24-hour format HH:mm
  endTime: string; // 24-hour format HH:mm
  price: {
    REGULAR: number;
    VIP: number;
    ACCESSIBLE: number;
  };
  isActive: boolean;
  availableSeats: {
    REGULAR: number;
    VIP: number;
    ACCESSIBLE: number;
  };
  bookedSeats: Array<{
    seatId: mongoose.Types.ObjectId;
    bookingId: mongoose.Types.ObjectId;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const showtimeSchema = new Schema<IShowtime>({
  movieId: {
    type: Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  screenId: {
    type: Schema.Types.ObjectId,
    ref: 'Screen',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
      },
      message: 'Start time must be in 24-hour format (HH:mm)'
    }
  },
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
      },
      message: 'End time must be in 24-hour format (HH:mm)'
    }
  },
  price: {
    REGULAR: {
      type: Number,
      required: true,
      min: 0
    },
    VIP: {
      type: Number,
      required: true,
      min: 0
    },
    ACCESSIBLE: {
      type: Number,
      required: true,
      min: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  availableSeats: {
    REGULAR: {
      type: Number,
      required: true,
      min: 0
    },
    VIP: {
      type: Number,
      required: true,
      min: 0
    },
    ACCESSIBLE: {
      type: Number,
      required: true,
      min: 0
    }
  },
  bookedSeats: [{
    seatId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Booking'
    }
  }]
}, {
  timestamps: true
});

// Compound index to prevent duplicate showtimes
showtimeSchema.index({ screenId: 1, date: 1, startTime: 1 }, { unique: true });

// Middleware to validate time slots don't overlap
showtimeSchema.pre('save', async function(next) {
  if (this.isModified('screenId') || this.isModified('date') || 
      this.isModified('startTime') || this.isModified('endTime')) {
    
    const startTime = this.startTime;
    const endTime = this.endTime;
    const date = new Date(this.date);
    date.setHours(0, 0, 0, 0);

    // Check for overlapping showtimes
    const overlapping = await Showtime.findOne({
      screenId: this.screenId,
      date: date,
      _id: { $ne: this._id },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (overlapping) {
      throw new Error('This time slot overlaps with another showtime');
    }
  }
  next();
});

// Helper method to check seat availability
showtimeSchema.methods.hasAvailableSeats = function(seatType: 'REGULAR' | 'VIP' | 'ACCESSIBLE', quantity: number) {
  return this.availableSeats[seatType] >= quantity;
};

// Helper method to update available seats
showtimeSchema.methods.updateAvailableSeats = function(
  seatType: 'REGULAR' | 'VIP' | 'ACCESSIBLE',
  quantity: number,
  operation: 'reserve' | 'release'
) {
  const multiplier = operation === 'reserve' ? -1 : 1;
  this.availableSeats[seatType] += (quantity * multiplier);
  return this.save();
};

export const Showtime = mongoose.model<IShowtime>('Showtime', showtimeSchema); 