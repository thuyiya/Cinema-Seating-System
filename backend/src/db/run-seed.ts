import { sequelize } from './config';
import * as seedMovies from './seeders/seed-movies';

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    await seedMovies.up(sequelize.getQueryInterface());
    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
})();