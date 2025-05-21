import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from './db/config';
import movieRoutes from './routes/movieRoutes';



const app = express();
const PORT = process.env.PORT || 3001;

// Database connection check
const checkDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync models (optional - only if using Sequelize models)
    // await sequelize.sync({ alter: true });
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Start server
const startServer = async () => {
  const dbConnected = await checkDatabase();
  if (!dbConnected) {
    console.error('❌ Exiting due to database connection failure');
    process.exit(1);
  }

  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api', movieRoutes);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();

// Get your free API key from https://www.themoviedb.org/settings/api
// const TMDB_API_KEY = process.env.TMDB_API_KEY;
// const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// app.get('/api/movies', async (req, res) => {
//   try {
//     // Fetch now playing movies
//     const nowPlaying = await axios.get(
//       `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`
//     );

//     // Fetch upcoming movies
//     const upcoming = await axios.get(
//       `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`
//     );

//     // Transform data to match our frontend needs
//     const nowShowing = nowPlaying.data.results.map((movie: any) => ({
//       id: movie.id,
//       title: movie.title,
//       poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
//       releaseDate: movie.release_date,
//       rating: movie.vote_average,
//       type: 'now_showing'
//     }));

//     const comingSoon = upcoming.data.results.map((movie: any) => ({
//       id: movie.id,
//       title: movie.title,
//       poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
//       releaseDate: movie.release_date,
//       rating: movie.vote_average,
//       type: 'coming_soon'
//     }));

//     res.json({
//       nowShowing,
//       comingSoon
//     });

//   } catch (error) {
//     console.error('Error fetching movies:', error);
//     res.status(500).json({ error: 'Failed to fetch movies' });
//   }
// });
