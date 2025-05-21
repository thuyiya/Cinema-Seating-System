export interface Movie {
  _id: string;
  tmdbId: number;
  title: string;
  overview: string;
  posterPath: string;
  releaseDate: string;
  duration: number;
  rating: number;
  type: 'now_showing' | 'coming_soon';
}

export interface MovieDetails extends Movie {
  screeningDates: ScreeningDate[];
}

export interface ScreeningDate {
  startDate: string;
  endDate: string;
}

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster: string;
  releaseDate: string;
  rating: number;
  duration: number;
  type: 'now_showing' | 'coming_soon';
}

export interface Showtime {
  _id: string;
  movieId: {
    _id: string;
    title: string;
  };
  screenId: {
    _id: string;
    number: number;
    name: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  price: {
    standard: number;
    vip: number;
    accessible: number;
  };
  availableSeats: {
    standard: number;
    vip: number;
    accessible: number;
  };
  isActive: boolean;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  type: 'standard' | 'vip' | 'accessible';
  isBooked: boolean;
} 