import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { sequelize } from '../db/config';
import { Movie } from '../models/movie';
import { Screening } from '../models/Screening';
import { v4 as uuidv4 } from 'uuid';
import { validationResult } from 'express-validator';

export const getMovies = async (req: Request, res: Response) => {
  try {
    const [nowShowing] = await sequelize.query(`
      SELECT m.* FROM "Movies" m
      JOIN "Screenings" s ON m.id = s."movieId"
      WHERE m."isActive" = true
      AND s."startsAt" > NOW()
      GROUP BY m.id
      ORDER BY m."createdAt" DESC
    `);

    const [comingSoon] = await sequelize.query(`
      SELECT * FROM "Movies"
      WHERE "isActive" = false
      ORDER BY "createdAt" DESC
    `);

    res.json({
      nowShowing,
      comingSoon
    });
  } catch (err) {
    console.error('Error fetching movies:', err);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
};

export const getMovieById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findByPk(id, {
      include: [{
        model: Screening,
        as: 'screenings',
        where: { startsAt: { [Op.gt]: new Date() } },
        required: false
      }]
    });

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(movie);
  } catch (err) {
    console.error('Error fetching movie:', err);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
};

export const createMovie = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, duration, rating, posterUrl, genres, isActive } = req.body;
    
    const movie = await Movie.create({
      id: uuidv4(),
      title,
      description,
      duration,
      rating,
      posterUrl,
      genres,
      isActive,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json(movie);
  } catch (err) {
    console.error('Error creating movie:', err);
    res.status(500).json({ error: 'Failed to create movie' });
  }
};

export const updateMovieById = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { title, description, duration, rating, posterUrl, genres, isActive } = req.body;

    const movie = await Movie.findByPk(id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const updatedMovie = await movie.update({
      title: title || movie.title,
      description: description || movie.description,
      duration: duration || movie.duration,
      rating: rating || movie.rating,
      posterUrl: posterUrl || movie.posterUrl,
      genres: genres || movie.genres,
      isActive: isActive !== undefined ? isActive : movie.isActive,
      updatedAt: new Date()
    });

    res.json(updatedMovie);
  } catch (err) {
    console.error('Error updating movie:', err);
    res.status(500).json({ error: 'Failed to update movie' });
  }
};

export const deleteMovieById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // First check if there are any upcoming screenings
    const upcomingScreenings = await Screening.count({
      where: {
        movieId: id,
        startsAt: { [Op.gt]: new Date() }
      }
    });

    if (upcomingScreenings > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete movie with upcoming screenings' 
      });
    }

    const result = await Movie.destroy({
      where: { id }
    });

    if (result === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting movie:', err);
    res.status(500).json({ error: 'Failed to delete movie' });
  }
};