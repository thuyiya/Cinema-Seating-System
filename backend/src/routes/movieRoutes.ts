import { Router } from 'express';
import { Request, Response } from 'express';
import { Movie, IMovie, IScreeningDate } from '../models/Movie';
import { authenticateJWT, authorizeRole } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// Add a new movie (admin only)
router.post('/', 
  authenticateJWT,
  authorizeRole([UserRole.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      const {
        tmdbId,
        title,
        overview,
        posterPath,
        releaseDate,
        rating,
        duration,
        type,
        screeningDates
      } = req.body;

      // Check if movie already exists
      const existingMovie = await Movie.findOne({ tmdbId });
      if (existingMovie) {
        return res.status(400).json({ 
          message: 'Movie already exists in the database' 
        });
      }

      // Validate screening dates
      if (!screeningDates || !Array.isArray(screeningDates) || screeningDates.length === 0) {
        return res.status(400).json({ 
          message: 'At least one screening date range is required' 
        });
      }

      // Validate rating
      if (typeof rating !== 'number' || rating < 0 || rating > 10) {
        return res.status(400).json({
          message: 'Rating must be a number between 0 and 10'
        });
      }

      // Validate duration
      if (typeof duration !== 'number' || duration < 1) {
        return res.status(400).json({
          message: 'Duration must be a positive number in minutes'
        });
      }

      // Validate each screening date range
      for (const date of screeningDates) {
        if (!date.startDate || !date.endDate) {
          return res.status(400).json({ 
            message: 'Both start and end dates are required for each screening period' 
          });
        }

        const startDate = new Date(date.startDate);
        const endDate = new Date(date.endDate);

        if (startDate >= endDate) {
          return res.status(400).json({ 
            message: 'End date must be after start date' 
          });
        }
      }

      const movie = new Movie({
        tmdbId,
        title,
        overview,
        posterPath,
        releaseDate: new Date(releaseDate),
        rating,
        duration,
        type,
        screeningDates: screeningDates.map(date => ({
          startDate: new Date(date.startDate),
          endDate: new Date(date.endDate)
        }))
      });

      await movie.save();

      res.status(201).json({
        message: 'Movie added successfully',
        movie
      });
    } catch (error) {
      console.error('Error adding movie:', error);
      res.status(500).json({ message: 'Error adding movie' });
    }
  }
);

// Get all movies grouped by type
router.get('/', async (req: Request, res: Response) => {
  try {
    // Get current date for filtering active screenings
    const currentDate = new Date();

    // Fetch all movies
    const movies = await Movie.find({}).sort({ createdAt: -1 });

    // Filter movies based on screening dates and type
    const nowShowing = movies.filter(movie => 
      movie.type === 'now_showing' && 
      movie.screeningDates.some((date: IScreeningDate) => 
        new Date(date.startDate) <= currentDate && 
        new Date(date.endDate) >= currentDate
      )
    ).map(movie => ({
      _id: movie._id,
      tmdbId: movie.tmdbId,
      title: movie.title,
      overview: movie.overview,
      posterPath: movie.posterPath,
      releaseDate: movie.releaseDate,
      type: movie.type,
      screeningDates: movie.screeningDates,
      rating: movie.rating,
      duration: movie.duration
    }));

    const comingSoon = movies.filter(movie => 
      movie.type === 'coming_soon' ||
      movie.screeningDates.every((date: IScreeningDate) => new Date(date.startDate) > currentDate)
    ).map(movie => ({
      _id: movie._id,
      tmdbId: movie.tmdbId,
      title: movie.title,
      overview: movie.overview,
      posterPath: movie.posterPath,
      releaseDate: movie.releaseDate,
      type: movie.type,
      screeningDates: movie.screeningDates,
      rating: movie.rating
    }));

    res.json({
      nowShowing,
      comingSoon
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: 'Error fetching movies' });
  }
});

// Get a specific movie
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json({ movie });
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ message: 'Error fetching movie' });
  }
});

// Update a movie (admin only)
router.put('/:id',
  authenticateJWT,
  authorizeRole([UserRole.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      const {
        title,
        overview,
        posterPath,
        releaseDate,
        type,
        screeningDates
      } = req.body;

      // Validate screening dates if provided
      if (screeningDates) {
        if (!Array.isArray(screeningDates) || screeningDates.length === 0) {
          return res.status(400).json({ 
            message: 'At least one screening date range is required' 
          });
        }

        for (const date of screeningDates) {
          if (!date.startDate || !date.endDate) {
            return res.status(400).json({ 
              message: 'Both start and end dates are required for each screening period' 
            });
          }

          const startDate = new Date(date.startDate);
          const endDate = new Date(date.endDate);

          if (startDate >= endDate) {
            return res.status(400).json({ 
              message: 'End date must be after start date' 
            });
          }
        }
      }

      const movie = await Movie.findByIdAndUpdate(
        req.params.id,
        {
          title,
          overview,
          posterPath,
          releaseDate: releaseDate ? new Date(releaseDate) : undefined,
          type,
          screeningDates: screeningDates?.map((date: IScreeningDate) => ({
            startDate: new Date(date.startDate),
            endDate: new Date(date.endDate)
          }))
        },
        { new: true }
      );

      if (!movie) {
        return res.status(404).json({ message: 'Movie not found' });
      }

      res.json({
        message: 'Movie updated successfully',
        movie
      });
    } catch (error) {
      console.error('Error updating movie:', error);
      res.status(500).json({ message: 'Error updating movie' });
    }
  }
);

// Delete a movie (admin only)
router.delete('/:id',
  authenticateJWT,
  authorizeRole([UserRole.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      const movie = await Movie.findByIdAndDelete(req.params.id);
      if (!movie) {
        return res.status(404).json({ message: 'Movie not found' });
      }
      res.json({ message: 'Movie deleted successfully' });
    } catch (error) {
      console.error('Error deleting movie:', error);
      res.status(500).json({ message: 'Error deleting movie' });
    }
  }
);

export default router; 