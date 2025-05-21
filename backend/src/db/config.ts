import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import dotenv from 'dotenv';
dotenv.config();

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export const migrator = new Umzug({
  migrations: {
    glob: ['src/db/migrations/*.ts', { cwd: __dirname }],
    resolve: ({ name, path, context }) => {
      const migration = require(path!);
      return {
        name,
        up: async () => migration.up(context),
        down: async () => migration.down(context),
      };
    }
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});