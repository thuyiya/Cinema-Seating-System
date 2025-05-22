import type { BookingRequest, BookingResponse, Seat, SeatingMap } from '../types/booking';
import api from './api';

interface TicketResponse {
  success: boolean;
  ticket: {
    ticketNumber: string;
    movieDetails: {
      title: string;
      posterUrl: string;
      duration: number;
    };
    showtime: {
      date: string;
      startTime: string;
      endTime: string;
      screen: string;
    };
    seats: Array<{
      row: string;
      number: number;
      type: string;
    }>;
    totalAmount: number;
    customerDetails: {
      name: string;
      email: string;
      phone: string;
    };
    status: string;
    qrCode: string;
    payment: {
      transactionId: string;
      status: string;
    };
  };
}

export class BookingService {
  static async findSeatsForGroup(groupSize: number, screeningId: string): Promise<Seat[]> {
    const response = await api.get<Seat[]>(`/screens/${screeningId}/seats/group`, {
      params: { size: groupSize }
    });
    return response.data;
  }

  static async getSeatingMap(screeningId: string): Promise<SeatingMap> {
    const response = await api.get<SeatingMap>(`/screens/${screeningId}/seats`);
    return response.data;
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

  static async getShowtime(showtimeId: string) {
    const response = await api.get(`/api/showtimes/${showtimeId}`);
    return response.data;
  }

  static async getShowtimeSeats(showtimeId: string, screenId: string) {
    const response = await api.get(`/api/showtimes/${showtimeId}/${screenId}/seats`);
    return response.data;
  }

  static async createBooking(bookingRequest: BookingRequest): Promise<BookingResponse> {
    const response = await api.post<BookingResponse>('/api/bookings', bookingRequest);
    return response.data;
  }

  static async processPayment(bookingId: string, cardDetails: {
    number: string;
    expiry: string;
    cvv: string;
  }): Promise<{
    success: boolean;
    booking: BookingResponse;
    payment: {
      transactionId: string;
      amount: number;
      status: string;
    };
  }> {
    const response = await api.post<{
      success: boolean;
      booking: BookingResponse;
      payment: {
        transactionId: string;
        amount: number;
        status: string;
      };
    }>(`/api/bookings/${bookingId}/complete`, {
      cardDetails
    });
    return response.data;
  }

  static async getPaymentDetails(paymentId: string) {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  }

  static async getBookingDetails(bookingId: string): Promise<BookingResponse> {
    const response = await api.get<BookingResponse>(`/api/bookings/${bookingId}`);
    return response.data;
  }

  static async getCinemaHalls() {
    const response = await api.get('/api/cinemas');
    return response.data;
  }

  static async getScreenings(movieId: string) {
    const response = await api.get(`/api/movies/${movieId}/screens`);
    return response.data;
  }

  static async getTicketDetails(ticketId: string): Promise<TicketResponse> {
    const response = await api.get<TicketResponse>(`/api/tickets/${ticketId}`);
    return response.data;
  }
} 