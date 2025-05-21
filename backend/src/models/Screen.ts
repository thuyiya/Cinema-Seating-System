import mongoose, { Document, Schema } from 'mongoose';

export interface ISeat {
  row: number;
  number: number;
  type: 'standard' | 'vip' | 'accessible';
  status: 'available' | 'broken' | 'maintenance';
  position: 'aisle' | 'middle' | 'edge';
  preferredView: boolean;
}

export interface ISection {
  name: string;
  rows: number;
  seatsPerRow: number;
  startRow: number;
  rowLabels: string[];
  seatLabels: string[];
  seats: ISeat[];
}

export interface IScreen extends Document {
  number: number;
  name: string;
  sections: ISection[];
  totalCapacity: number;
  layout: {
    type: 'straight' | 'curved' | 'c-shaped';
    hasBalcony: boolean;
    aislePositions: number[]; // Seat numbers where aisles are located
  };
  seatingRules: {
    allowSplitGroups: boolean;
    maxGroupSize: number;
    allowSinglesBetweenGroups: boolean;
    preferredStartingRows: number[];
    vipRowsRange: {
      start: number;
      end: number;
    };
    accessibleSeatsLocations: {
      row: number;
      seatStart: number;
      seatEnd: number;
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const seatSchema = new Schema<ISeat>({
  row: { type: Number, required: true },
  number: { type: Number, required: true },
  type: {
    type: String,
    enum: ['standard', 'vip', 'accessible'],
    default: 'standard'
  },
  status: {
    type: String,
    enum: ['available', 'broken', 'maintenance'],
    default: 'available'
  },
  position: {
    type: String,
    enum: ['aisle', 'middle', 'edge'],
    required: true
  },
  preferredView: { type: Boolean, default: false }
});

const sectionSchema = new Schema<ISection>({
  name: { type: String, required: true },
  rows: { type: Number, required: true },
  seatsPerRow: { type: Number, required: true },
  startRow: { type: Number, required: true },
  rowLabels: [{ type: String }],
  seatLabels: [{ type: String }],
  seats: [seatSchema]
});

const screenSchema = new Schema<IScreen>({
  number: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  sections: [sectionSchema],
  totalCapacity: {
    type: Number,
    required: true
  },
  layout: {
    type: {
      type: String,
      enum: ['straight', 'curved', 'c-shaped'],
      required: true
    },
    hasBalcony: {
      type: Boolean,
      default: false
    },
    aislePositions: [{
      type: Number,
      required: true
    }]
  },
  seatingRules: {
    allowSplitGroups: {
      type: Boolean,
      default: false
    },
    maxGroupSize: {
      type: Number,
      default: 7
    },
    allowSinglesBetweenGroups: {
      type: Boolean,
      default: false
    },
    preferredStartingRows: [{
      type: Number,
      required: true
    }],
    vipRowsRange: {
      start: {
        type: Number,
        required: true
      },
      end: {
        type: Number,
        required: true
      }
    },
    accessibleSeatsLocations: [{
      row: {
        type: Number,
        required: true
      },
      seatStart: {
        type: Number,
        required: true
      },
      seatEnd: {
        type: Number,
        required: true
      }
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Helper function to generate seats for a section
function generateSeats(section: ISection): ISeat[] {
  const seats: ISeat[] = [];
  for (let row = 0; row < section.rows; row++) {
    for (let seatNum = 0; seatNum < section.seatsPerRow; seatNum++) {
      seats.push({
        row: section.startRow + row,
        number: seatNum + 1,
        type: 'standard',
        status: 'available',
        position: seatNum === 0 ? 'edge' : 
                 seatNum === section.seatsPerRow - 1 ? 'edge' : 'middle',
        preferredView: false
      });
    }
  }
  return seats;
}

// Pre-save middleware to generate seats and calculate capacity
screenSchema.pre('save', function(next) {
  // Generate seats for each section if they don't exist
  this.sections.forEach(section => {
    if (!section.seats || section.seats.length === 0) {
      section.seats = generateSeats(section);
    }
  });

  // Calculate total capacity
  this.totalCapacity = this.sections.reduce((total, section) => {
    return total + section.seats.filter(seat => seat.status === 'available').length;
  }, 0);

  next();
});

export const Screen = mongoose.model<IScreen>('Screen', screenSchema); 