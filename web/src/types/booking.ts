export interface Movie {
  id: string;
  title: string;
  description: string;
  duration: number;
  posterUrl: string;
}

export interface Cinema {
  id: string;
  name: string;  // e.g., "C1", "C2"
  capacity: number;
  rows: number;
  seatsPerRow: number;
}

export interface Screening {
  id: string;
  movieId: string;
  cinemaId: string;
  startTime: string;
  endTime: string;
  price: number;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  type: 'REGULAR' | 'VIP' | 'ACCESSIBLE';
  isAvailable: boolean;
}

export interface SeatingMap {
  rows: {
    id: string;
    seats: Seat[];
  }[];
}

export interface BookingRequest {
  screeningId: string;
  seats: string[];
  customerDetails?: {
    name: string;
    email: string;
    mobile: string;
  };
  requestType?: 'REGULAR' | 'VIP' | 'ACCESSIBLE';
  groupSize: number;
}

export interface BookingResponse {
  bookingId: string;
  screeningId: string;
  movieTitle: string;
  screenName: string;
  showtime: string;
  seats: string[];
  totalAmount: number;
  customerDetails: {
    name: string;
    email: string;
    mobile: string;
  };
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  ticketNumber: string;
} 