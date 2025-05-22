import dotenv from 'dotenv';
dotenv.config();

if (!process.env.TMDB_API_KEY) {
  process.exit(1);
}

export const TMDB_CONFIG = {
  API_KEY: process.env.TMDB_API_KEY,
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500'
} as const; 