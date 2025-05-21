import { Request, Response } from 'express';
import axios from 'axios';
import { TMDB_CONFIG } from '../config/tmdb.config';

export const getMovies = async (req: Request, res: Response) => {
  try {
    const nowPlaying = await axios.get(
      `${TMDB_CONFIG.BASE_URL}/movie/now_playing?api_key=${TMDB_CONFIG.API_KEY}&language=en-US&page=1`
    );

    const upcoming = await axios.get(
      `${TMDB_CONFIG.BASE_URL}/movie/upcoming?api_key=${TMDB_CONFIG.API_KEY}&language=en-US&page=1`
    );

    // Fetch detailed movie information including runtime
    const fetchMovieDetails = async (movieId: number) => {
      const response = await axios.get(
        `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}&language=en-US`
      );
      return response.data.runtime || 120; // Default to 120 minutes if runtime is not available
    };

    // Process now showing movies with duration
    const nowShowing = await Promise.all(
      nowPlaying.data.results.map(async (movie: any) => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        poster: `${TMDB_CONFIG.IMAGE_BASE_URL}${movie.poster_path}`,
        releaseDate: movie.release_date,
        rating: movie.vote_average,
        duration: await fetchMovieDetails(movie.id),
        type: 'now_showing'
      }))
    );

    // Process upcoming movies with duration
    const comingSoon = await Promise.all(
      upcoming.data.results.map(async (movie: any) => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        poster: `${TMDB_CONFIG.IMAGE_BASE_URL}${movie.poster_path}`,
        releaseDate: movie.release_date,
        rating: movie.vote_average,
        duration: await fetchMovieDetails(movie.id),
        type: 'coming_soon'
      }))
    );

    res.json({
      nowShowing,
      comingSoon
    });

  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
}; 