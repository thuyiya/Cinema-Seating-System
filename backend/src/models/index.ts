import { Sequelize } from 'sequelize';
import { Movie } from './movie';
import { Screening } from './Screening';

// Models are already initialized in their respective files
// and associations are defined in the Screening model file
export function initializeModels(sequelize: Sequelize) {
  return {
    Movie,
    Screening
  };
}

export { Movie, Screening };