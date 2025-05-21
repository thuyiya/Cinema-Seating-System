import mongoose, { Document, Schema } from 'mongoose';

export interface IScreeningDate {
  startDate: Date;
  endDate: Date;
}

export interface IMovie extends Document {
  tmdbId: number;
  title: string;
  overview: string;
  posterPath: string;
  releaseDate: Date;
  rating: number;
  type: 'now_showing' | 'coming_soon';
  screeningDates: IScreeningDate[];
  createdAt: Date;
  updatedAt: Date;
}

const screeningDateSchema = new Schema<IScreeningDate>({
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  }
});

const movieSchema = new Schema<IMovie>({
  tmdbId: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  overview: {
    type: String,
    required: true
  },
  posterPath: {
    type: String,
    required: true
  },
  releaseDate: {
    type: Date,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  type: {
    type: String,
    enum: ['now_showing', 'coming_soon'],
    required: true
  },
  screeningDates: [screeningDateSchema]
}, {
  timestamps: true
});

export const Movie = mongoose.model<IMovie>('Movie', movieSchema); 