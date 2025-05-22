import type { BookingRequest, BookingResponse, Seat, SeatingMap, Section } from '../types/booking';
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

interface ShowtimeSeatsResponse {
  sections: Section[];
  layout: {
    type: 'straight' | 'curved' | 'c-shaped';
    hasBalcony: boolean;
    aislePositions: number[];
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
    
    // Check each section's seats for isolated seats
    for (const section of simulatedMap.sections) {
      // Group seats by row
      const rowGroups = section.seats.reduce<Record<string, Seat[]>>((acc, seat) => {
        if (!acc[seat.row]) {
          acc[seat.row] = [];
        }
        acc[seat.row].push(seat);
        return acc;
      }, {});

      // Check each row for isolated seats
      for (const rowSeats of Object.values(rowGroups)) {
        // Sort seats by number for proper adjacency check
        const sortedSeats = rowSeats.sort((a, b) => a.number - b.number);
        const seatStatuses = sortedSeats.map(seat => !seat.isBooked);
        
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
    }
    
    return false;
  }

  private static simulateOccupancy(seatingMap: SeatingMap, selectedSeats: Seat[]): SeatingMap {
    const simulatedMap: SeatingMap = JSON.parse(JSON.stringify(seatingMap));
    
    for (const selectedSeat of selectedSeats) {
      for (const section of simulatedMap.sections) {
        const seat = section.seats.find((s: Seat) => s.id === selectedSeat.id);
        if (seat) {
          seat.isBooked = true;
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
    const response = await api.get<ShowtimeSeatsResponse>(`/api/showtimes/${showtimeId}/${screenId}/seats`);
    return response.data.sections;
  }

  static async createBooking(bookingData: BookingRequest): Promise<BookingResponse> {
    const response = await api.post<BookingResponse>('/api/bookings', bookingData);
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