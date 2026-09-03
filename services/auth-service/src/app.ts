import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy', service: 'auth-service' });
  });

  app.use('/api/v1/auth', authRoutes);

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: 'Resource not found in auth-service.',
    });
  });

  app.use(errorHandler);

  return app;
};
