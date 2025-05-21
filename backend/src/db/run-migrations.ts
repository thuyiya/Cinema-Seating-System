import { migrator } from './config';

const command = process.argv[2];

(async () => {
  if (command === 'up') {
    await migrator.up();
    console.log('✅ Migrations completed successfully');
  } else if (command === 'down') {
    await migrator.down();
    console.log('✅ Migrations rolled back successfully');
  } else {
    console.log('❌ Please specify "up" or "down"');
    process.exit(1);
  }
  process.exit(0);
})().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});