import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import tmdbRoutes from './routes/tmdbRoutes';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  const apiRouter = express.Router();
  app.use('/api', apiRouter);

  apiRouter.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString()
    });
  });

  apiRouter.use('/tmdb', tmdbRoutes);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
