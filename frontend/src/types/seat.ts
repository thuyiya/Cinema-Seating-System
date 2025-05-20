export type SeatType = 'standard' | 'accessible' | 'broken' | 'gap';
export type SeatSection = 'left' | 'center' | 'right';

export interface Seat {
  id: number;
  row: number;
  number: number;
  type: SeatType;
  isOccupied: boolean;
  price: number;
  section: SeatSection;
}

export interface SeatMap {
  rows: number;
  seatsPerRow: number;
  seats: Seat[];
}

export interface SeatSelection {
  selectedSeats: number[];
  totalPrice: number;
}