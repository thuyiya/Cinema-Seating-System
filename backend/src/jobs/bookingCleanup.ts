import { Booking } from '../models/Booking';
import { Model } from 'mongoose';

// Cleanup interval in milliseconds (1 minute)
const CLEANUP_INTERVAL = 60 * 1000;

export function startBookingCleanupJob() {
  console.log('Starting booking cleanup job...');
  
  // Run cleanup immediately on start
  (Booking as unknown as { cleanupExpiredBookings: () => Promise<void> })
    .cleanupExpiredBookings()
    .catch((error: unknown) => {
      console.error('Error in booking cleanup job:', error);
    });

  // Schedule periodic cleanup
  const intervalId = setInterval(() => {
    (Booking as unknown as { cleanupExpiredBookings: () => Promise<void> })
      .cleanupExpiredBookings()
      .catch((error: unknown) => {
        console.error('Error in booking cleanup job:', error);
      });
  }, CLEANUP_INTERVAL);

  // Return the interval ID so it can be cleared if needed
  return intervalId;
}

export function stopBookingCleanupJob(intervalId: NodeJS.Timeout) {
  clearInterval(intervalId);
  console.log('Booking cleanup job stopped.');
} 