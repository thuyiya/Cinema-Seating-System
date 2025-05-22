import { Booking } from '../models/Booking';
import { Model } from 'mongoose';

// Cleanup interval in milliseconds (1 minute)
const CLEANUP_INTERVAL = 60 * 1000;

// Orphaned seats cleanup interval (every 5 minutes)
const ORPHANED_CLEANUP_INTERVAL = 5 * 60 * 1000;

export function startBookingCleanupJob() {
  console.log('Starting booking cleanup jobs...');
  
  // Run cleanup immediately on start
  (Booking as unknown as { cleanupExpiredBookings: () => Promise<void> })
    .cleanupExpiredBookings()
    .catch((error: unknown) => {
      console.error('Error in booking cleanup job:', error);
    });

  // Run orphaned seats cleanup immediately on start
  (Booking as unknown as { cleanupOrphanedSeats: () => Promise<void> })
    .cleanupOrphanedSeats()
    .catch((error: unknown) => {
      console.error('Error in orphaned seats cleanup job:', error);
    });

  // Schedule periodic cleanup for expired bookings
  const bookingIntervalId = setInterval(() => {
    (Booking as unknown as { cleanupExpiredBookings: () => Promise<void> })
      .cleanupExpiredBookings()
      .catch((error: unknown) => {
        console.error('Error in booking cleanup job:', error);
      });
  }, CLEANUP_INTERVAL);

  // Schedule periodic cleanup for orphaned seats
  const orphanedIntervalId = setInterval(() => {
    (Booking as unknown as { cleanupOrphanedSeats: () => Promise<void> })
      .cleanupOrphanedSeats()
      .catch((error: unknown) => {
        console.error('Error in orphaned seats cleanup job:', error);
      });
  }, ORPHANED_CLEANUP_INTERVAL);

  // Return both interval IDs
  return { bookingIntervalId, orphanedIntervalId };
}

export function stopBookingCleanupJob(intervalIds: { bookingIntervalId: NodeJS.Timeout, orphanedIntervalId: NodeJS.Timeout }) {
  clearInterval(intervalIds.bookingIntervalId);
  clearInterval(intervalIds.orphanedIntervalId);
  console.log('Booking cleanup jobs stopped.');
} 