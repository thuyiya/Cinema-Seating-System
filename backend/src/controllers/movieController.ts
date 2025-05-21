import { Request, Response } from 'express';
import { sequelize } from '../db/config';

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