// store/bookingStore.ts
import { create } from 'zustand';

interface BookingState {
  selectedMovie: string | null;
  selectedSeats: string[];
  setSelectedMovie: (id: string) => void;
  setSelectedSeats: (seats: string[]) => void;
}

export const useBookingStore = create<BookingState>(set => ({
  selectedMovie: null,
  selectedSeats: [],
  setSelectedMovie: (id) => set({ selectedMovie: id }),
  setSelectedSeats: (seats) => set({ selectedSeats: seats }),
}));