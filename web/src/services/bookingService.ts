import type { BookingRequest, BookingResponse, Seat, SeatingMap } from '../types/booking';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class BookingService {
  static async findSeatsForGroup(groupSize: number, screeningId: string): Promise<Seat[]> {
    const response = await fetch(`${API_BASE_URL}/api/screens/${screeningId}/seats/group?size=${groupSize}`);
    if (!response.ok) throw new Error('Failed to find seats');
    return response.json();
  }

  static async getSeatingMap(screeningId: string): Promise<SeatingMap> {
    const response = await fetch(`${API_BASE_URL}/api/screens/${screeningId}/seats`);
    if (!response.ok) throw new Error('Failed to get seating map');
    return response.json();
  }

  static wouldCreateSingleSeatGap(seatingMap: SeatingMap, selectedSeats: Seat[]): boolean {
    // Create a temporary map with selected seats marked as occupied
    const simulatedMap = this.simulateOccupancy(seatingMap, selectedSeats);
    
    // Check each row for isolated seats
    for (const row of simulatedMap.rows) {
      const seatStatuses = row.seats.map(seat => seat.isAvailable);
      
      // Look for available seats surrounded by occupied seats or walls
      for (let i = 0; i < seatStatuses.length; i++) {
        if (
          seatStatuses[i] && // Seat is available
          (i === 0 || !seatStatuses[i-1]) && // Left is wall or occupied
          (i === seatStatuses.length-1 || !seatStatuses[i+1]) // Right is wall or occupied
        ) {
          return true;
        }
      }
    }
    
    return false;
  }

  private static simulateOccupancy(seatingMap: SeatingMap, selectedSeats: Seat[]): SeatingMap {
    const simulatedMap: SeatingMap = JSON.parse(JSON.stringify(seatingMap));
    
    for (const selectedSeat of selectedSeats) {
      for (const row of simulatedMap.rows) {
        const seat = row.seats.find(s => s.id === selectedSeat.id);
        if (seat) {
          seat.isAvailable = false;
        }
      }
    }
    
    return simulatedMap;
  }

  static async createBooking(bookingRequest: BookingRequest): Promise<BookingResponse> {
    const response = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create booking');
    }

    return response.json();
  }

  static async processPayment(bookingId: string, paymentDetails: any): Promise<BookingResponse> {
    const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentDetails),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Payment failed');
    }

    return response.json();
  }

  static async getBookingDetails(bookingId: string): Promise<BookingResponse> {
    const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`);
    if (!response.ok) throw new Error('Failed to get booking details');
    return response.json();
  }

  static async getCinemaHalls() {
    const response = await fetch(`${API_BASE_URL}/api/cinemas`);
    if (!response.ok) throw new Error('Failed to get cinema halls');
    return response.json();
  }

  static async getScreenings(movieId: string) {
    const response = await fetch(`${API_BASE_URL}/api/movies/${movieId}/screens`);
    if (!response.ok) throw new Error('Failed to get screenings');
    return response.json();
  }
} 