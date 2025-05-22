interface Price {
  standard: number;
  vip: number;
  accessible: number;
}

interface AvailableSeats {
  standard: number;
  vip: number;
  accessible: number;
}

interface MovieInfo {
  _id: string;
  title: string;
  duration: number;
}

interface ScreenInfo {
  _id: string;
  number: number;
  name: string;
  id: string;
}

export interface Showtime {
  _id: string;
  price: Price;
  availableSeats: AvailableSeats;
  movieId: MovieInfo;
  screenId: ScreenInfo;
  date: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Export sub-interfaces if needed separately
export type { Price, AvailableSeats, MovieInfo, ScreenInfo }; 