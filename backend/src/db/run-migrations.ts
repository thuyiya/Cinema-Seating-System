import { migrator, sequelize } from './config';

const command = process.argv[2];

(async () => {
  try {
    // Verify database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    if (command === 'up') {
      await migrator.up();
      console.log('✅ All migrations completed successfully');
    } else if (command === 'down') {
      await migrator.down();
      console.log('✅ Migrations rolled back successfully');
    } else {
      console.log('❌ Please specify "up" or "down"');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
})();