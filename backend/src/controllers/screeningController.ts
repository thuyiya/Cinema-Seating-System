import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { sequelize } from '../db/config';
import { Screening } from '../models/Screening';
import { Movie } from '../models/movie';
import { v4 as uuidv4 } from 'uuid';
import { validationResult } from 'express-validator';

export const getScreenings = async (req: Request, res: Response) => {
  try {
    const screenings = await Screening.findAll({
      where: {
        startsAt: { [Op.gt]: new Date() }
      },
      include: [{
        model: Movie,
        as: 'movie'
      }],
      order: [['startsAt', 'ASC']]
    });

    res.json(screenings);
  } catch (err) {
    console.error('Error fetching screenings:', err);
    res.status(500).json({ error: 'Failed to fetch screenings' });
  }
};

export const getScreeningById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const screening = await Screening.findByPk(id, {
      include: [{
        model: Movie,
        as: 'movie'
      }]
    });

    if (!screening) {
      return res.status(404).json({ error: 'Screening not found' });
    }

    res.json(screening);
  } catch (err) {
    console.error('Error fetching screening:', err);
    res.status(500).json({ error: 'Failed to fetch screening' });
  }
};

export const createScreening = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { movieId, screenNumber, startsAt, endsAt } = req.body;

    // Check if movie exists
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Check for screening time conflicts
    const conflictingScreening = await Screening.findOne({
      where: {
        screenNumber,
        [Op.or]: [
          {
            startsAt: { [Op.between]: [startsAt, endsAt] }
          },
          {
            endsAt: { [Op.between]: [startsAt, endsAt] }
          }
        ]
      }
    });

    if (conflictingScreening) {
      return res.status(400).json({ error: 'Time slot conflicts with another screening' });
    }

    const screening = await Screening.create({
      id: uuidv4(),
      movieId,
      screenNumber,
      startsAt,
      endsAt,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json(screening);
  } catch (err) {
    console.error('Error creating screening:', err);
    res.status(500).json({ error: 'Failed to create screening' });
  }
};

export const updateScreeningById = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { movieId, screenNumber, startsAt, endsAt } = req.body;

    const screening = await Screening.findByPk(id);
    if (!screening) {
      return res.status(404).json({ error: 'Screening not found' });
    }

    if (movieId) {
      const movie = await Movie.findByPk(movieId);
      if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
      }
    }

    // Check for screening time conflicts
    if (startsAt && endsAt) {
      const conflictingScreening = await Screening.findOne({
        where: {
          id: { [Op.ne]: id },
          screenNumber: screenNumber || screening.screenNumber,
          [Op.or]: [
            {
              startsAt: { [Op.between]: [startsAt, endsAt] }
            },
            {
              endsAt: { [Op.between]: [startsAt, endsAt] }
            }
          ]
        }
      });

      if (conflictingScreening) {
        return res.status(400).json({ error: 'Time slot conflicts with another screening' });
      }
    }

    const updatedScreening = await screening.update({
      movieId: movieId || screening.movieId,
      screenNumber: screenNumber || screening.screenNumber,
      startsAt: startsAt || screening.startsAt,
      endsAt: endsAt || screening.endsAt,
      updatedAt: new Date()
    });

    res.json(updatedScreening);
  } catch (err) {
    console.error('Error updating screening:', err);
    res.status(500).json({ error: 'Failed to update screening' });
  }
};

export const deleteScreeningById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const screening = await Screening.findByPk(id);
    if (!screening) {
      return res.status(404).json({ error: 'Screening not found' });
    }

    // Only allow deletion of future screenings
    if (new Date(screening.startsAt) <= new Date()) {
      return res.status(400).json({ error: 'Cannot delete past or ongoing screenings' });
    }

    await screening.destroy();
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting screening:', err);
    res.status(500).json({ error: 'Failed to delete screening' });
  }
}; 