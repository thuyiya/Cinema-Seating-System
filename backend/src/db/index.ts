import { Pool } from 'pg';

const poolConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD), 
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false,
};

const pool = new Pool(poolConfig);

const testConnection = async () => {
  let retries = 5;
  while (retries) {
    try {
      await pool.query('SELECT NOW()');
      console.log('✅ Database connected successfully');
      break;
    } catch (err) {
      retries -= 1;
      console.error(`❌ Database connection failed, ${retries} retries left...`);
      if (retries === 0) {
        console.error('Failed to connect to database after retries:', err);
        process.exit(1);
      }
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

testConnection();

export default pool;