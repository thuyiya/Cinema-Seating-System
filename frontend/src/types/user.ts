export interface User {
  id: string;
  username: string;
}

export interface SeatSelection {
  seatId: number;
  userId: string;
  timestamp: number;
}