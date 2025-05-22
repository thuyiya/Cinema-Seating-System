import dotenv from 'dotenv';
dotenv.config(); // this should be the second line of the file

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import passport from 'passport';
import tmdbRoutes from './routes/tmdbRoutes';
import authRoutes from './routes/authRoutes';
import movieRoutes from './routes/movieRoutes';
import screenRoutes from './routes/screenRoutes';
import showtimeRoutes from './routes/showtimeRoutes';
import bookingRoutes from './routes/bookingRoutes';
import paymentRoutes from './routes/paymentRoutes';
import { startBookingCleanupJob } from './jobs/bookingCleanup';

const app = express();
const PORT = process.env.PORT || 3001;

// Update MongoDB URI to explicitly include SSL settings
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cinema-booking';
const mongoUri = MONGODB_URI.includes('mongodb+srv') 
  ? MONGODB_URI + '&ssl=true&tlsInsecure=true'
  : MONGODB_URI;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('📦 Connected to MongoDB');

    // Start the booking cleanup job
    startBookingCleanupJob();
    console.log('🧹 Started booking cleanup job');

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(morgan('dev'));
    app.use(passport.initialize());

    // API Routes
    const apiRouter = express.Router();
    app.use('/api', apiRouter);

    apiRouter.get('/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString()
      });
    });

    // Mount routes
    apiRouter.use('/auth', authRoutes);
    apiRouter.use('/tmdb', tmdbRoutes);
    apiRouter.use('/movies', movieRoutes);
    apiRouter.use('/screens', screenRoutes);
    apiRouter.use('/showtimes', showtimeRoutes);
    apiRouter.use('/bookings', bookingRoutes);
    apiRouter.use('/payments', paymentRoutes);
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
