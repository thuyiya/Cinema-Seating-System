import { QueryInterface, QueryTypes } from 'sequelize';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  genre_ids: number[];
  release_date: string;
}

interface TMDBResponse {
  results: TMDBMovie[];
}

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'your_api_key_here';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  try {
    // Verify Movies table exists
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('Movies')) {
      throw new Error('Movies table does not exist');
    }

    // Fetch movies from TMDB
    const [nowPlayingResponse, upcomingResponse] = await Promise.all([
      axios.get<TMDBResponse>(
        `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`
      ),
      axios.get<TMDBResponse>(
        `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`
      )
    ]);

    // Generate UUIDs explicitly for each movie
    const moviesToInsert = [
      ...nowPlayingResponse.data.results.slice(0, 3).map(movie => ({
        id: uuidv4(), // Explicitly generate UUID
        title: movie.title,
        description: movie.overview,
        duration: Math.floor(Math.random() * 60) + 90,
        rating: movie.vote_average,
        posterUrl: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null,
        genres: movie.genre_ids.map(getGenreName),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      ...upcomingResponse.data.results.slice(0, 2).map(movie => ({
        id: uuidv4(), // Explicitly generate UUID
        title: movie.title,
        description: movie.overview,
        duration: Math.floor(Math.random() * 60) + 90,
        rating: movie.vote_average,
        posterUrl: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null,
        genres: movie.genre_ids.map(getGenreName),
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    ];

    // Insert movies with explicit IDs
    await queryInterface.bulkInsert('Movies', moviesToInsert);

    // Get inserted movie IDs
    const movies: { id: string }[] = await queryInterface.sequelize.query<{ id: string }>(
      'SELECT id FROM "Movies" ORDER BY "createdAt" DESC',
      { type: QueryTypes.SELECT }
    );

    // Create screenings with explicit UUIDs
    const screenings = [
      {
        id: uuidv4(),
        movieId: movies[0].id,
        screenNumber: 1,
        startsAt: new Date(Date.now() + 86400000),
        endsAt: new Date(Date.now() + 86400000 + (moviesToInsert[0].duration * 60000)),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        movieId: movies[1].id,
        screenNumber: 2,
        startsAt: new Date(Date.now() + 172800000),
        endsAt: new Date(Date.now() + 172800000 + (moviesToInsert[1].duration * 60000)),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Screenings', screenings);

    console.log('✅ Seed data inserted successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

// Genre mapping helper
function getGenreName(genreId: number): string {
  const genreMap: Record<number, string> = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
    80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
    14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
    9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
    53: 'Thriller', 10752: 'War', 37: 'Western'
  };
  return genreMap[genreId] || 'Other';
}

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.bulkDelete('Screenings', {});
  await queryInterface.bulkDelete('Movies', {});
};