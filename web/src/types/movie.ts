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
    layout: {
      type: 'straight' | 'curved' | 'c-shaped';
      hasBalcony: boolean;
      aislePositions: number[];
    };
  };
  date: string;
  startTime: string;
  endTime: string;
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
  isActive: boolean;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  type: 'REGULAR' | 'VIP' | 'ACCESSIBLE';
  isBooked: boolean;
  status?: 'available' | 'booked' | 'broken' | 'maintenance';
  position: 'aisle' | 'middle' | 'edge';
  preferredView: boolean;
} 