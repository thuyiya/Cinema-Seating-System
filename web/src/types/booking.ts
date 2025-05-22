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
  _id?: string;
  showtimeId: string;
  seats: {
    seatId: string;
    row: string;
    number: number;
    type: 'REGULAR' | 'VIP' | 'ACCESSIBLE';
    price: number;
  }[];
  guestInfo?: {
    name: string;
    email: string;
    mobile: string;
  };
  groupSize: number;
  totalAmount: number;
}

export interface BookingResponse {
  bookingId?: string;
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  showtimeId: {
    price: {
      REGULAR: number;
      VIP: number;
      ACCESSIBLE: number;
    };
    availableSeats: {
      REGULAR: number;
      VIP: number;
      ACCESSIBLE: number;
    };
    _id: string;
    movieId: string;
    screenId: string;
    date: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    bookedSeats: Array<{
      seatId: string;
      bookingId: string;
      _id: string;
    }>;
  };
  seats: Array<{
    seatId: string;
    row: string;
    number: number;
    type: 'REGULAR' | 'VIP' | 'ACCESSIBLE';
    _id: string;
  }>;
  totalAmount: number;
  status: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
} 