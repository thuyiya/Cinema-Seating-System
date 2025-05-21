import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'cinemax',
  username: process.env.DB_USER || 'cinemax_user',
  password: process.env.DB_PASSWORD || 'cinemax_password',
  logging: false, // Disable logging for migrations
});

export const migrator = new Umzug({
  migrations: {
    glob: ['src/db/migrations/*.ts', { cwd: process.cwd() }],
    resolve: ({ name, path, context }) => {
      if (!path) throw new Error('Path is undefined');
      const migration = require(path);
      return {
        name,
        up: async () => migration.up(context),
        down: async () => migration.down(context),
      };
    }
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ 
    sequelize,
    modelName: 'migration_meta' 
  }),
  logger: console,
});