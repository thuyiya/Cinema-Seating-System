import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

const migrationsDir = path.join(__dirname, 'migrations');
const timestamp = format(new Date(), 'yyyyMMddHHmmss');

const migrationContent = `import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  // Migration code here
}

export async function down(queryInterface: QueryInterface) {
  // Rollback code here
}
`;

if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

const filename = path.join(migrationsDir, `${timestamp}-migration.ts`);
fs.writeFileSync(filename, migrationContent);

console.log(`✅ Created new migration: ${filename}`);