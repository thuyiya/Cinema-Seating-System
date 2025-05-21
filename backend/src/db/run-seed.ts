import { sequelize } from './config';
import { up } from './seeders/seed-movies';

(async () => {
  try {
    await up(sequelize.getQueryInterface());
    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
})();